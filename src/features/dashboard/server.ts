import { prisma } from "@/lib/db";

export type DashboardStats = {
  totalItems: number;
  totalMovements: number;
  totalLocations: number;
};

export type RecentMovement = {
  id: string;
  type: string;
  quantity: string;
  createdAt: Date;
  item: { name: string };
  location: { name: string };
};

export type LowStockItem = {
  id: string;
  quantity: string;
  item: { name: string; lowStockThreshold: string };
  location: { name: string };
};

export type DashboardData = {
  orgName: string;
  stats: DashboardStats;
  recentActivity: RecentMovement[];
  lowStock: LowStockItem[];
};

export async function getDashboardData(orgId: string): Promise<DashboardData> {
  const [org, totalItems, totalMovements, totalLocations, recentActivity, allStock] =
    await Promise.all([
      prisma.organization.findUnique({ where: { id: orgId }, select: { name: true } }),
      prisma.item.count({ where: { orgId } }),
      prisma.movement.count({ where: { orgId } }),
      prisma.location.count({ where: { orgId } }),
      prisma.movement.findMany({
        where: { orgId },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { item: true, location: true },
      }),
      prisma.currentStock.findMany({
        where: { orgId },
        include: { item: true, location: true },
      }),
    ]);

  const lowStock = allStock
    .filter((stock) => {
      const qty = Number(stock.quantity);
      const threshold = stock.item.lowStockThreshold
        ? Number(stock.item.lowStockThreshold)
        : 0;
      return qty <= threshold;
    })
    .map((stock) => ({
      id: stock.id,
      quantity: stock.quantity.toString(),
      item: {
        name: stock.item.name,
        lowStockThreshold: (stock.item.lowStockThreshold || 0).toString(),
      },
      location: { name: stock.location.name },
    }));

  return {
    orgName: org?.name ?? "Command Center",
    stats: { totalItems, totalMovements, totalLocations },
    recentActivity: recentActivity.map((m) => ({
      id: m.id,
      type: m.type,
      quantity: m.quantity.toString(),
      createdAt: m.createdAt,
      item: { name: m.item.name },
      location: { name: m.location.name },
    })),
    lowStock,
  };
}
