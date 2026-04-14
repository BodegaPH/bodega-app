import { AdminExportsPanel } from "@/features/admin/components";
import { getPlatformAdminMonitoringExports } from "@/features/admin/server";

export default async function AdminExportsPage() {
  const exportsEntries = getPlatformAdminMonitoringExports();
  return <AdminExportsPanel entries={exportsEntries} />;
}
