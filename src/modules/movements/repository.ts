/**
 * Movements Repository - Prisma data access layer
 * INTERNAL: Only import from service.ts within this module
 */
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { CreateMovementInput, GetMovementsFilters, MovementType } from "./types";

export async function listMovements(orgId: string, filters: GetMovementsFilters) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 50;
  const skip = (page - 1) * limit;

  const where: Prisma.MovementWhereInput = {
    orgId,
    ...(filters.itemId ? { itemId: filters.itemId } : {}),
    ...(filters.locationId ? { locationId: filters.locationId } : {}),
    ...(filters.from || filters.to
      ? {
          createdAt: {
            ...(filters.from ? { gte: filters.from } : {}),
            ...(filters.to ? { lte: filters.to } : {}),
          },
        }
      : {}),
  };

  const [movements, total] = await Promise.all([
    prisma.movement.findMany({
      where,
      select: {
        id: true,
        type: true,
        quantity: true,
        reason: true,
        createdAt: true,
        item: { select: { id: true, name: true, sku: true, unit: true } },
        location: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.movement.count({ where }),
  ]);

  return { movements, total, page, limit };
}

export async function createMovementWithStockUpdate(
  orgId: string,
  input: CreateMovementInput,
  delta: number
) {
  return prisma.$transaction(async (tx) => {
    // Atomic upsert for stock
    const [stockResult] = await tx.$queryRaw<[{ quantity: number }]>`
      INSERT INTO "CurrentStock" ("id", "orgId", "itemId", "locationId", "quantity", "updatedAt")
      VALUES (gen_random_uuid(), ${orgId}, ${input.itemId}, ${input.locationId}, ${delta}, NOW())
      ON CONFLICT ("orgId", "itemId", "locationId")
      DO UPDATE SET 
        quantity = "CurrentStock".quantity + ${delta},
        "updatedAt" = NOW()
      RETURNING quantity::float as quantity
    `;

    // Insert immutable movement record
    const movement = await tx.movement.create({
      data: {
        orgId,
        itemId: input.itemId,
        locationId: input.locationId,
        createdById: input.createdById,
        type: input.type,
        quantity: Math.abs(input.quantity),
        reason: input.reason,
      },
      select: { id: true, type: true, quantity: true, reason: true, createdAt: true },
    });

    return { movement, newStockQuantity: stockResult.quantity };
  });
}

export async function countMovements(orgId: string): Promise<number> {
  return prisma.movement.count({ where: { orgId } });
}
