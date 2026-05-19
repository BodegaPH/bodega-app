import {
  getCurrentStock,
  getRecentIssueSeries,
  listTopRiskSnapshots,
  upsertSnapshot,
} from "./repository";
import { SimulationApiError } from "./errors";
import type {
  GetTopRiskOptions,
  MonteCarloConfig,
  RecomputeTarget,
  SimulationMetrics,
  SimulationSnapshotDTO,
} from "./types";

const DEFAULT_CONFIG: MonteCarloConfig = {
  horizonDays: 30,
  iterations: 5000,
  lookbackDays: 90,
};

const DEFAULT_LIST_LIMIT = 5;

class LcgRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next() {
    this.state = (1664525 * this.state + 1013904223) >>> 0;
    return this.state / 4294967296;
  }
}

function mergeConfig(options: Partial<MonteCarloConfig>): MonteCarloConfig {
  const config: MonteCarloConfig = {
    horizonDays: options.horizonDays ?? DEFAULT_CONFIG.horizonDays,
    iterations: options.iterations ?? DEFAULT_CONFIG.iterations,
    lookbackDays: options.lookbackDays ?? DEFAULT_CONFIG.lookbackDays,
    seed: options.seed,
  };

  if (!Number.isInteger(config.horizonDays) || config.horizonDays <= 0) {
    throw new SimulationApiError("horizonDays must be a positive integer", 400);
  }
  if (!Number.isInteger(config.iterations) || config.iterations <= 0) {
    throw new SimulationApiError("iterations must be a positive integer", 400);
  }
  if (!Number.isInteger(config.lookbackDays) || config.lookbackDays <= 0) {
    throw new SimulationApiError("lookbackDays must be a positive integer", 400);
  }

  return config;
}

function mean(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function stdDev(values: number[], avg: number) {
  if (values.length <= 1) return 0;
  const variance = values.reduce((sum, value) => {
    const delta = value - avg;
    return sum + delta * delta;
  }, 0) / values.length;
  return Math.sqrt(variance);
}

function sampleNormal(random: LcgRandom, avg: number, sigma: number) {
  if (sigma <= 0) return Math.max(0, avg);

  const u1 = Math.max(random.next(), Number.EPSILON);
  const u2 = random.next();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return Math.max(0, avg + sigma * z0);
}

function percentile(sortedValues: number[], p: number) {
  if (sortedValues.length === 0) return 0;
  const clampedP = Math.min(1, Math.max(0, p));
  const idx = Math.floor((sortedValues.length - 1) * clampedP);
  return sortedValues[idx];
}

function runMonteCarlo(
  currentStock: number,
  demandSeries: number[],
  config: MonteCarloConfig,
): SimulationMetrics {
  const avg = mean(demandSeries);
  const sigma = stdDev(demandSeries, avg);
  const seed = config.seed ?? Date.now();
  const random = new LcgRandom(seed);

  const endings: number[] = [];
  let stockoutCount = 0;

  for (let i = 0; i < config.iterations; i++) {
    let stock = currentStock;
    let stockedOut = false;

    for (let day = 0; day < config.horizonDays; day++) {
      const demand = sampleNormal(random, avg, sigma);
      stock -= demand;
      if (stock < 0) {
        stockedOut = true;
      }
    }

    if (stockedOut) {
      stockoutCount += 1;
    }

    endings.push(stock);
  }

  endings.sort((a, b) => a - b);

  return {
    stockoutProbability: stockoutCount / config.iterations,
    p10EndingStock: percentile(endings, 0.1),
    p50EndingStock: percentile(endings, 0.5),
    p90EndingStock: percentile(endings, 0.9),
    meanDailyDemand: avg,
    demandStdDev: sigma,
    sampleSizeDays: demandSeries.length,
  };
}

export async function recomputeSnapshotForTarget(
  target: RecomputeTarget,
  options: Partial<MonteCarloConfig> = {},
): Promise<void> {
  const config = mergeConfig(options);

  const [series, currentStock] = await Promise.all([
    getRecentIssueSeries(
      target.orgId,
      target.itemId,
      target.locationId,
      config.lookbackDays,
    ),
    getCurrentStock(target.orgId, target.itemId, target.locationId),
  ]);

  const metrics = runMonteCarlo(currentStock, series, config);
  await upsertSnapshot(target, config, metrics);
}

export async function getTopRiskSnapshots(
  orgId: string,
  options: GetTopRiskOptions = {},
): Promise<SimulationSnapshotDTO[]> {
  const config = mergeConfig(options);
  const limit =
    options.limit && Number.isInteger(options.limit) && options.limit > 0
      ? options.limit
      : DEFAULT_LIST_LIMIT;

  return listTopRiskSnapshots(orgId, config.horizonDays, limit);
}
