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
    <section className="space-y-4">
      {monitoringUnavailable ? (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          Monitoring data unavailable. Showing degraded overview state.
        </div>
      ) : null}
      <AdminOverview overview={overview} />
    </section>
  );
}
