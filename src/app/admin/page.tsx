import { AdminOverview } from "@/features/admin/components";
import {
  getPlatformAdminMonitoringOverview,
  type MonitoringOverviewDto,
} from "@/features/admin/server";

const fallbackOverview: MonitoringOverviewDto = {
  lowStockCount: 0,
  recentAdjustmentsCount: 0,
  largeOutboundCount: 0,
  orgCount: 0,
  userCount: 0,
  recentActivity: [],
};

export default async function AdminPage() {
  let overview = fallbackOverview;
  let monitoringUnavailable = false;

  try {
    overview = await getPlatformAdminMonitoringOverview();
  } catch {
    monitoringUnavailable = true;
  }

  return (
    <section className="flex-1 flex flex-col space-y-4">
      {monitoringUnavailable ? (
        <div className="rounded-none border border-amber-500/30 bg-amber-950/30 px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-amber-400">
          [WARNING] Monitoring data unavailable. Showing degraded overview state.
        </div>
      ) : null}
      <AdminOverview overview={overview} />
    </section>
  );
}
