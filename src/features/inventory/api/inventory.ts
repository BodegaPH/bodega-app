import { prisma } from "@/lib/db";

export type InventoryRow = {
  id: string;
  quantity: string;
  item: {
    id: string;
    name: string;
    sku: string;
    unit: string;
    category: string | null;
    lowStockThreshold: string | null;
  };
  location: {
    id: string;
    name: string;
  };
};

export type InventoryPageData = {
  inventory: InventoryRow[];
  items: { id: string; name: string; sku: string; unit: string }[];
  locations: { id: string; name: string; isDefault: boolean }[];
};

export async function getInventory(orgId: string): Promise<InventoryPageData> {
  const [rawInventory, items, locations] = await Promise.all([
    prisma.currentStock.findMany({
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
    }),
    prisma.item.findMany({
      where: { orgId, isActive: true },
      select: { id: true, name: true, sku: true, unit: true },
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({
      where: { orgId },
      select: { id: true, name: true, isDefault: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const inventory = rawInventory.map((row) => ({
    id: row.id,
    quantity: row.quantity.toString(),
    item: {
      ...row.item,
      lowStockThreshold: row.item.lowStockThreshold?.toString() ?? null,
    },
    location: row.location,
  }));

  return { inventory, items, locations };
}
