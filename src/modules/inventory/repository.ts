/**
 * Inventory Repository - Prisma data access layer
 * INTERNAL: Only import from service.ts within this module
 */
import { prisma } from "@/lib/db";

export async function listCurrentStock(orgId: string) {
  return prisma.currentStock.findMany({
    where: { orgId },
    select: {
      id: true,
      quantity: true,
      updatedAt: true,
      item: {
        select: {
          id: true,
          name: true,
          sku: true,
          unit: true,
          category: true,
          lowStockThreshold: true,
        },
      },
      location: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      item: { name: "asc" },
    },
  });
}

export async function countStock(orgId: string): Promise<number> {
  return prisma.currentStock.count({ where: { orgId } });
}
