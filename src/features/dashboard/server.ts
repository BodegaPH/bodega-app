import { getDataCount as getItemCount } from "@/modules/items";
import { getDataCount as getLocationCount } from "@/modules/locations";
import {
  getMovements,
  getDataCount as getMovementCount,
} from "@/modules/movements";
import { getLowStockItems } from "@/modules/inventory";
import { getOrganizationName } from "@/modules/organizations";
import {
  getInventoryIndicators,
  type InventoryIndicators,
} from "@/modules/indicators";
import { getTopRiskSnapshots, type SimulationSnapshotDTO } from "@/modules/simulation";

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
  volumeData: { date: string; volume: number }[];
  simulationRisk: SimulationSnapshotDTO[];
};

export async function getDashboardData(orgId: string): Promise<DashboardData> {
  const [
    orgName,
    totalItems,
    totalMovements,
    totalLocations,
    recentActivity,
    lowStock,
    chartMovements,
    simulationRisk,
  ] = (await Promise.all([
    getOrganizationName(orgId),
    getItemCount(orgId),
    getMovementCount(orgId),
    getLocationCount(orgId),
    getMovements(orgId, { page: 1, limit: 5 }),
    getLowStockItems(orgId),
    getMovements(orgId, { page: 1, limit: 100 }),
    getTopRiskSnapshots(orgId, {
      horizonDays: 30,
      iterations: 5000,
      lookbackDays: 90,
      limit: 5,
    }).catch(() => []),
  ])) as [
    string | null,
    number,
    number,
    number,
    Awaited<ReturnType<typeof getMovements>>,
    Awaited<ReturnType<typeof getLowStockItems>>,
    Awaited<ReturnType<typeof getMovements>>,
    Awaited<ReturnType<typeof getTopRiskSnapshots>>,
  ];

  return {
    orgName: orgName ?? "Command Center",
    stats: { totalItems, totalMovements, totalLocations },
    recentActivity: recentActivity.movements.map((m) => ({
      id: m.id,
      type: m.type,
      quantity: m.quantity,
      createdAt: new Date(m.createdAt),
      item: { name: m.item!.name },
      location: { name: m.location!.name },
    })),
    lowStock: lowStock.map((stock) => ({
      id: stock.id,
      quantity: stock.quantity,
      item: {
        name: stock.item.name,
        lowStockThreshold: stock.item.lowStockThreshold ?? "0",
      },
      location: { name: stock.location.name },
    })),
    volumeData: (() => {
      const grouped = chartMovements.movements.reduce((acc, m) => {
        const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(m.createdAt));
        acc[date] = (acc[date] || 0) + Math.abs(parseFloat(m.quantity) || 0);
        return acc;
      }, {} as Record<string, number>);
      return chartMovements.movements
        .map(m => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(m.createdAt)))
        .filter((value, index, self) => self.indexOf(value) === index)
        .reverse()
        .map(date => ({ date, volume: grouped[date] }));
    })(),
    simulationRisk,
  };
}

/**
 * Get inventory indicators for dashboard alerts
 */
export async function getIndicators(
  orgId: string,
): Promise<InventoryIndicators> {
  return getInventoryIndicators(orgId);
}
