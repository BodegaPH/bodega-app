import { AdminUsersTable } from "@/features/admin/components";
import { getPlatformAdminMonitoringUsers } from "@/features/admin/server";
import type { SystemRole } from "@prisma/client";
import type { MonitoringUsersListRowDto } from "@/modules/admin/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface UsersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function getStringParam(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function getPageParam(value: string | string[] | undefined): number {
  if (typeof value !== "string") return 1;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function getSystemRoleParam(value: string | string[] | undefined): SystemRole | undefined {
  if (typeof value !== "string") return undefined;
  if (value === "USER" || value === "SYSTEM_ADMIN" || value === "PLATFORM_ADMIN") {
    return value;
  }
  return undefined;
}

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const page = getPageParam(params.page);
  const orgId = getStringParam(params.orgId);
  const role = getSystemRoleParam(params.systemRole);
  const actorUserId = session?.user?.id;

  let monitoringUnavailable = false;
  const users = await getPlatformAdminMonitoringUsers({
    page,
    pageSize: 25,
    orgId,
    actorUserId,
    systemRole: role,
  }).catch(() => {
    monitoringUnavailable = true;
    return {
      rows: [] as MonitoringUsersListRowDto[],
      pagination: {
        page,
        pageSize: 25,
        total: 0,
        totalPages: 1,
      },
    } as const;
  });
  const rows = users.rows;
  const pagination = users.pagination;

  const buildPageHref = (nextPage: number) => {
    const qp = new URLSearchParams();
    qp.set("page", String(nextPage));
    if (orgId) qp.set("orgId", orgId);
    if (role) qp.set("systemRole", role);
    return `/admin/users?${qp.toString()}`;
  };

  const previousPageHref = buildPageHref(Math.max(1, pagination.page - 1));
  const nextPageHref = buildPageHref(Math.min(pagination.totalPages, pagination.page + 1));

  return (
    <section className="space-y-4">
      {monitoringUnavailable ? (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          Monitoring data unavailable. User directory is in degraded mode.
        </div>
      ) : null}
      <div className="flex items-end justify-between px-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Directory</h1>
          <p className="text-sm text-zinc-400">Manage all system users and roles.</p>
        </div>
        <div className="flex gap-2 text-xs text-zinc-500">
          {orgId && <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1">Org: {orgId}</span>}
          {role && <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1">Role: {role}</span>}
        </div>
      </div>

      <AdminUsersTable
        rows={rows}
        pagination={pagination}
        previousPageHref={previousPageHref}
        nextPageHref={nextPageHref}
      />
    </section>
  );
}
