import Link from "next/link";
import type { MonitoringAuditRowDto } from "@/modules/admin/types";
import type { AdminPagination } from "@/features/admin/types";

interface AdminAuditTableProps {
  rows: MonitoringAuditRowDto[];
  pagination: AdminPagination;
  previousPageHref: string;
  nextPageHref: string;
}

export default function AdminAuditTable({
  rows,
  pagination,
  previousPageHref,
  nextPageHref,
}: AdminAuditTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-900/40 px-6 py-14 text-center backdrop-blur-3xl">
        <h3 className="text-lg font-medium tracking-tight text-zinc-200">No audit rows found</h3>
        <p className="mt-2 text-sm text-zinc-500">
          Try widening your filters while keeping the 90-day bound.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-900/50 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Organization</th>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row) => (
              <tr key={row.movementId} className="text-zinc-300 hover:bg-white/[0.01]">
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">{row.createdAt}</td>
                <td className="px-4 py-3 text-zinc-300">{row.orgName}</td>
                <td className="px-4 py-3 text-zinc-300">{row.itemName}</td>
                <td className="px-4 py-3 text-zinc-400">{row.locationName}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-300">
                    {row.type}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-300">{row.quantity}</td>
                <td className="px-4 py-3 text-zinc-400">{row.actorName ?? row.actorEmail ?? "Unknown"}</td>
                <td className="px-4 py-3 text-zinc-500">{row.reason ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-white/5 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-400 backdrop-blur-3xl">
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={previousPageHref}
              aria-disabled={pagination.page <= 1}
              className={`rounded-md border border-white/5 px-3 py-1.5 ${
                pagination.page <= 1
                  ? "pointer-events-none opacity-40"
                  : "hover:bg-white/5 text-zinc-300"
              }`}
            >
              Previous
            </Link>
            <Link
              href={nextPageHref}
              aria-disabled={pagination.page >= pagination.totalPages}
              className={`rounded-md border border-white/5 px-3 py-1.5 ${
                pagination.page >= pagination.totalPages
                  ? "pointer-events-none opacity-40"
                  : "hover:bg-white/5 text-zinc-300"
              }`}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
