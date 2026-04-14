import Link from "next/link";
import type { MonitoringOverviewDto } from "@/features/admin/server";

interface AdminOverviewProps {
  overview: MonitoringOverviewDto;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-5 backdrop-blur-3xl">
      <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{value}</p>
    </div>
  );
}

export default function AdminOverview({ overview }: AdminOverviewProps) {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-6 backdrop-blur-3xl">
        <div className="inline-flex items-center rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-blue-200">
          Platform Monitoring
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Admin Monitoring Overview
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400 sm:text-base">
          Cross-organization visibility for users, inventory risk signals, and movement audit.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Low Stock" value={overview.lowStockCount} />
        <StatCard label="Recent Adjustments" value={overview.recentAdjustmentsCount} />
        <StatCard label="Large Outbound" value={overview.largeOutboundCount} />
        <StatCard label="Organizations" value={overview.orgCount} />
        <StatCard label="Users" value={overview.userCount} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/users"
          className="rounded-2xl border border-white/5 bg-zinc-900/40 p-5 text-sm text-zinc-300 backdrop-blur-3xl transition hover:bg-zinc-900/60"
        >
          <p className="font-medium text-white">Users</p>
          <p className="mt-1 text-zinc-400">Inspect cross-org membership and role visibility.</p>
        </Link>
        <Link
          href="/admin/audit"
          className="rounded-2xl border border-white/5 bg-zinc-900/40 p-5 text-sm text-zinc-300 backdrop-blur-3xl transition hover:bg-zinc-900/60"
        >
          <p className="font-medium text-white">Audit</p>
          <p className="mt-1 text-zinc-400">Review movement history with bounded filters.</p>
        </Link>
        <Link
          href="/admin/exports"
          className="rounded-2xl border border-white/5 bg-zinc-900/40 p-5 text-sm text-zinc-300 backdrop-blur-3xl transition hover:bg-zinc-900/60"
        >
          <p className="font-medium text-white">Exports</p>
          <p className="mt-1 text-zinc-400">Access monitoring export entrypoints.</p>
        </Link>
      </div>

      <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4 text-xs text-zinc-500 backdrop-blur-3xl">
        Monitoring views are read-only. User role management requires step-up authentication.
      </div>
    </section>
  );
}
