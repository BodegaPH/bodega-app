import { prisma } from "@/lib/db";
import type {
  MonteCarloConfig,
  RecomputeTarget,
  SimulationMetrics,
  SimulationSnapshotDTO,
} from "./types";

function toFixedNumber(value: number, digits: number) {
  return Number(value.toFixed(digits));
}

function toDailySeries(totalsByDay: Map<string, number>, lookbackDays: number) {

  const now = new Date();
  const series: number[] = [];

  for (let i = lookbackDays - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    series.push(totalsByDay.get(key) ?? 0);
  }

  return series;
}

export async function getRecentIssueSeries(
  orgId: string,
  itemId: string,
  locationId: string,
  lookbackDays: number,
): Promise<number[]> {
  const from = new Date();
  from.setUTCDate(from.getUTCDate() - lookbackDays + 1);
  from.setUTCHours(0, 0, 0, 0);

  const rows = await prisma.movement.findMany({
    where: {
      orgId,
      itemId,
      locationId,
      type: "ISSUE",
      createdAt: { gte: from },
    },
    select: {
      createdAt: true,
      quantity: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const foldedByDay = new Map<string, number>();
  for (const row of rows) {
    const key = row.createdAt.toISOString().slice(0, 10);
    const prev = foldedByDay.get(key) ?? 0;
    foldedByDay.set(key, prev + Number(row.quantity.toString()));
  }

  return toDailySeries(foldedByDay, lookbackDays);
}

export async function getCurrentStock(
  orgId: string,
  itemId: string,
  locationId: string,
): Promise<number> {
  const stock = await prisma.currentStock.findUnique({
    where: {
      orgId_itemId_locationId: {
        orgId,
        itemId,
        locationId,
      },
    },
    select: { quantity: true },
  });

  return Number(stock?.quantity?.toString() ?? "0");
}

export async function upsertSnapshot(
  target: RecomputeTarget,
  config: MonteCarloConfig,
  metrics: SimulationMetrics,
): Promise<void> {
  await prisma.$executeRaw`
    INSERT INTO "SimulationSnapshot" (
      "id",
      "orgId",
      "itemId",
      "locationId",
      "horizonDays",
      "iterations",
      "lookbackDays",
      "stockoutProbability",
      "p10EndingStock",
      "p50EndingStock",
      "p90EndingStock",
      "meanDailyDemand",
      "demandStdDev",
      "sampleSizeDays",
      "generatedAt",
      "updatedAt"
    ) VALUES (
      gen_random_uuid(),
      ${target.orgId},
      ${target.itemId},
      ${target.locationId},
      ${config.horizonDays},
      ${config.iterations},
      ${config.lookbackDays},
      ${toFixedNumber(metrics.stockoutProbability, 4)},
      ${toFixedNumber(metrics.p10EndingStock, 2)},
      ${toFixedNumber(metrics.p50EndingStock, 2)},
      ${toFixedNumber(metrics.p90EndingStock, 2)},
      ${toFixedNumber(metrics.meanDailyDemand, 4)},
      ${toFixedNumber(metrics.demandStdDev, 4)},
      ${metrics.sampleSizeDays},
      NOW(),
      NOW()
    )
    ON CONFLICT ("orgId", "itemId", "locationId", "horizonDays")
    DO UPDATE SET
      "iterations" = EXCLUDED."iterations",
      "lookbackDays" = EXCLUDED."lookbackDays",
      "stockoutProbability" = EXCLUDED."stockoutProbability",
      "p10EndingStock" = EXCLUDED."p10EndingStock",
      "p50EndingStock" = EXCLUDED."p50EndingStock",
      "p90EndingStock" = EXCLUDED."p90EndingStock",
      "meanDailyDemand" = EXCLUDED."meanDailyDemand",
      "demandStdDev" = EXCLUDED."demandStdDev",
      "sampleSizeDays" = EXCLUDED."sampleSizeDays",
      "generatedAt" = NOW(),
      "updatedAt" = NOW()
  `;
}

export async function listTopRiskSnapshots(
  orgId: string,
  horizonDays: number,
  limit: number,
): Promise<SimulationSnapshotDTO[]> {
  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      orgId: string;
      itemId: string;
      locationId: string;
      itemName: string;
      itemSku: string;
      locationName: string;
      horizonDays: number;
      iterations: number;
      lookbackDays: number;
      stockoutProbability: { toString(): string };
      p10EndingStock: { toString(): string };
      p50EndingStock: { toString(): string };
      p90EndingStock: { toString(): string };
      meanDailyDemand: { toString(): string };
      demandStdDev: { toString(): string };
      sampleSizeDays: number;
      generatedAt: Date;
      updatedAt: Date;
    }>
  >`
    SELECT
      s."id",
      s."orgId",
      s."itemId",
      s."locationId",
      i."name" as "itemName",
      i."sku" as "itemSku",
      l."name" as "locationName",
      s."horizonDays",
      s."iterations",
      s."lookbackDays",
      s."stockoutProbability",
      s."p10EndingStock",
      s."p50EndingStock",
      s."p90EndingStock",
      s."meanDailyDemand",
      s."demandStdDev",
      s."sampleSizeDays",
      s."generatedAt",
      s."updatedAt"
    FROM "SimulationSnapshot" s
    JOIN "Item" i ON i."id" = s."itemId"
    JOIN "Location" l ON l."id" = s."locationId"
    WHERE s."orgId" = ${orgId}
      AND s."horizonDays" = ${horizonDays}
    ORDER BY s."stockoutProbability" DESC, s."generatedAt" DESC
    LIMIT ${limit}
  `;

  return rows.map((row: (typeof rows)[number]) => ({
    id: row.id,
    orgId: row.orgId,
    itemId: row.itemId,
    locationId: row.locationId,
    itemName: row.itemName,
    itemSku: row.itemSku,
    locationName: row.locationName,
    horizonDays: row.horizonDays,
    iterations: row.iterations,
    lookbackDays: row.lookbackDays,
    stockoutProbability: Number(row.stockoutProbability.toString()),
    p10EndingStock: Number(row.p10EndingStock.toString()),
    p50EndingStock: Number(row.p50EndingStock.toString()),
    p90EndingStock: Number(row.p90EndingStock.toString()),
    meanDailyDemand: Number(row.meanDailyDemand.toString()),
    demandStdDev: Number(row.demandStdDev.toString()),
    sampleSizeDays: row.sampleSizeDays,
    generatedAt: row.generatedAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}
