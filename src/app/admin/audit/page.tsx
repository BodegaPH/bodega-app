import { AdminAuditTable } from "@/features/admin/components";
import { getPlatformAdminMonitoringAudit } from "@/features/admin/server";
import type { MovementType } from "@prisma/client";
import type { MonitoringAuditRowDto } from "@/modules/admin/types";

interface AuditPageProps {
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

function getMovementTypeParam(value: string | string[] | undefined): MovementType | undefined {
  if (typeof value !== "string") return undefined;
  if (value === "RECEIVE" || value === "ISSUE" || value === "ADJUSTMENT") {
    return value;
  }
  return undefined;
}

export default async function AdminAuditPage({ searchParams }: AuditPageProps) {
  const params = await searchParams;
  const page = getPageParam(params.page);
  const from = getStringParam(params.from);
  const to = getStringParam(params.to);
  const movementType = getMovementTypeParam(params.type);
  const orgId = getStringParam(params.orgId);

  let monitoringUnavailable = false;
  const audit = await getPlatformAdminMonitoringAudit({
    page,
    pageSize: 50,
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
    type: movementType,
    orgId,
  }).catch(() => {
    monitoringUnavailable = true;
    return {
      rows: [] as MonitoringAuditRowDto[],
      pagination: {
        page,
        pageSize: 50,
        total: 0,
        totalPages: 1,
      },
    } as const;
  });
  const rows = audit.rows;
  const pagination = audit.pagination;

  const buildPageHref = (nextPage: number) => {
    const qp = new URLSearchParams();
    qp.set("page", String(nextPage));
    if (from) qp.set("from", from);
    if (to) qp.set("to", to);
    if (movementType) qp.set("type", movementType);
    if (orgId) qp.set("orgId", orgId);
    return `/admin/audit?${qp.toString()}`;
  };

  const previousPageHref = buildPageHref(Math.max(1, pagination.page - 1));
  const nextPageHref = buildPageHref(Math.min(pagination.totalPages, pagination.page + 1));

  return (
    <section className="space-y-4">
      {monitoringUnavailable ? (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          Monitoring data unavailable. Audit view is in degraded mode.
        </div>
      ) : null}
      <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-6 backdrop-blur-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Movement Audit</h1>
        <p className="mt-2 text-sm text-zinc-400 sm:text-base">
          Cross-org movement history with bounded, read-only filters.
        </p>
        <p className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          Filter hint: audit windows are bounded to a maximum of 90 days.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-500">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            Page: {pagination.page}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            From: {from ?? "—"}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            To: {to ?? "—"}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            Type: {movementType ?? "All"}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            Org: {orgId ?? "All"}
          </span>
        </div>
      </div>

      <AdminAuditTable
        rows={rows}
        pagination={pagination}
        previousPageHref={previousPageHref}
        nextPageHref={nextPageHref}
      />
    </section>
  );
}
