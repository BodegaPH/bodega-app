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
      <div className="rounded-none border border-dashed border-white/10 bg-zinc-950 px-6 py-14 text-center">
        <h3 className="text-[12px] font-mono uppercase tracking-widest text-zinc-200">No audit rows found</h3>
        <p className="mt-2 text-[10px] font-mono text-zinc-500">
          Try widening your filters while keeping the 90-day bound.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-none border border-white/10 bg-zinc-950">
        <table className="min-w-full text-left text-[12px] font-mono">
          <thead className="bg-zinc-900/50 text-[10px] uppercase tracking-widest text-zinc-500 border-b border-white/5">
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
                  <span className="inline-flex rounded-none border border-indigo-500/30 bg-indigo-950/30 px-2 py-0.5 text-[10px] uppercase tracking-widest text-indigo-400">
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
        <div className="flex items-center justify-between rounded-none border border-white/10 bg-zinc-950 px-4 py-3 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={previousPageHref}
              aria-disabled={pagination.page <= 1}
              className={`rounded-none border border-white/10 px-3 py-1.5 transition-none ${
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
              className={`rounded-none border border-white/10 px-3 py-1.5 transition-none ${
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
