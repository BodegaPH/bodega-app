"use client";

import Link from "next/link";
import { useState } from "react";
import type { MonitoringUsersListRowDto } from "@/modules/admin/types";
import type { AdminPagination } from "@/features/admin/types";
import { extractApiErrorMessage } from "@/lib/client-errors";

interface AdminUsersTableProps {
  rows: MonitoringUsersListRowDto[];
  pagination: AdminPagination;
  previousPageHref: string;
  nextPageHref: string;
}

export default function AdminUsersTable({
  rows,
  pagination,
  previousPageHref,
  nextPageHref,
}: AdminUsersTableProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  async function handleRoleChange(userId: string, role: "USER" | "PLATFORM_ADMIN") {
    try {
      setPendingUserId(userId);
      setMessage(null);

      const password = window.prompt("Confirm your admin password");
      if (!password) {
        setMessage("Step-up password is required");
        return;
      }

      const stepUpResponse = await fetch("/api/admin/step-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!stepUpResponse.ok) {
        const payload = await stepUpResponse.json().catch(() => null);
        setMessage(extractApiErrorMessage(payload, "Step-up authentication failed"));
        return;
      }

      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        setMessage(extractApiErrorMessage(payload, "Failed to update user role"));
        return;
      }

      setMessage("Role updated");
      window.location.reload();
    } catch {
      setMessage("Network error while updating role");
    } finally {
      setPendingUserId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-900/40 px-6 py-14 text-center backdrop-blur-3xl">
        <h3 className="text-lg font-medium tracking-tight text-zinc-200">No users found</h3>
        <p className="mt-2 text-sm text-zinc-500">
          No records match the current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message ? (
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs text-blue-200">
          {message}
        </div>
      ) : null}
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900/50 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">System Role</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row) => (
              <tr key={`${row.userId}:${row.orgId}`} className="text-zinc-300 hover:bg-white/[0.01]">
                <td className="px-4 py-3">
                  <div className="font-medium text-zinc-200">
                    {row.name || "Unknown user"}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    {row.email || "No email"}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-300">
                    {row.systemRole}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {row.systemRole === "PLATFORM_ADMIN" ? (
                    <button
                      type="button"
                      onClick={() => handleRoleChange(row.userId, "USER")}
                      disabled={pendingUserId === row.userId}
                      className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-300 disabled:opacity-40"
                    >
                      Demote
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRoleChange(row.userId, "PLATFORM_ADMIN")}
                      disabled={pendingUserId === row.userId}
                      className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-blue-200 disabled:opacity-40"
                    >
                      Promote
                    </button>
                  )}
                </td>
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
