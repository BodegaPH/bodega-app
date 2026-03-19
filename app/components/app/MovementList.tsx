"use client";

import { ArrowDownUp } from "lucide-react";

interface Movement {
  id: string;
  type: "RECEIVE" | "ISSUE" | "ADJUSTMENT";
  quantity: string;
  reason: string | null;
  createdAt: string;
  item: {
    id: string;
    name: string;
    sku: string;
    unit: string;
  };
  location: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface MovementListProps {
  movements: Movement[];
  pagination: Pagination;
  onPageChange: (page: number) => void;
}

export default function MovementList({ movements, pagination, onPageChange }: MovementListProps) {
  if (movements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01] px-4 py-16 text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10">
          <ArrowDownUp className="h-6 w-6 text-blue-400" />
        </div>
        <h3 className="mb-2 text-lg font-medium text-white">No movements found</h3>
        <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
          No stock movements match the current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900/70 text-xs uppercase tracking-wide text-zinc-400">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Created By</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((movement) => {
              const date = new Date(movement.createdAt);
              const formattedDate = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              let typeBadge: { label: string; classes: string };
              if (movement.type === "RECEIVE") {
                typeBadge = {
                  label: "Receive",
                  classes: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
                };
              } else if (movement.type === "ISSUE") {
                typeBadge = {
                  label: "Issue",
                  classes: "border-rose-500/20 bg-rose-500/10 text-rose-300",
                };
              } else {
                typeBadge = {
                  label: "Adjustment",
                  classes: "border-amber-500/20 bg-amber-500/10 text-amber-300",
                };
              }

              return (
                <tr key={movement.id} className="border-t border-white/5 text-zinc-200">
                  <td className="px-4 py-3 text-zinc-300">{formattedDate}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{movement.item.name}</div>
                    <div className="text-xs text-zinc-400 font-mono">{movement.item.sku}</div>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{movement.location.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${typeBadge.classes}`}
                    >
                      {typeBadge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-white">
                      {movement.quantity} {movement.item.unit}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{movement.reason || "-"}</td>
                  <td className="px-4 py-3 text-zinc-300">
                    {movement.createdBy.name || movement.createdBy.email || "Unknown"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 rounded-xl border border-white/10 bg-zinc-900/60 text-sm text-zinc-300 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          <span className="text-sm text-zinc-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 rounded-xl border border-white/10 bg-zinc-900/60 text-sm text-zinc-300 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
