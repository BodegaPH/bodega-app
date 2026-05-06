import Link from "next/link";
import type { MonitoringOverviewDto } from "@/features/admin/server";


interface AdminOverviewProps {
  overview: MonitoringOverviewDto;
}

export default function AdminOverview({ overview }: AdminOverviewProps) {
  return (
    <div className="flex-1 flex flex-col gap-px bg-white/10 p-px rounded-none overflow-hidden max-w-[1800px] animate-in fade-in duration-500 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between bg-zinc-950 p-4">
        <h1 className="text-[11px] font-mono tracking-[0.2em] text-zinc-400 uppercase">
           PLATFORM ADMIN [SYSTEM_MATRIX_ACTIVE]
        </h1>
        <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 border border-indigo-500/30 bg-indigo-950/30 px-2 py-0.5">
          Monitoring Active
        </span>
      </div>

      {/* Top KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-white/10">
        {[
          { label: "Organizations", value: overview.orgCount },
          { label: "Users", value: overview.userCount },
          { label: "Low Stock", value: overview.lowStockCount },
          { label: "Recent Adjustments", value: overview.recentAdjustmentsCount },
          { label: "Large Outbound", value: overview.largeOutboundCount },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-zinc-950 p-6 flex flex-col justify-center hover:bg-zinc-900/80 transition-colors"
          >
            <p className="text-[10px] font-mono text-zinc-500 tracking-[0.2em] uppercase mb-2">
              {stat.label}
            </p>
            <p className="text-3xl font-mono tracking-tight text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Platform Activity Feed */}
      <div className="flex-1 flex flex-col bg-zinc-950 p-6 border-t border-white/10 overflow-hidden">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-[10px] font-mono text-zinc-500 tracking-[0.2em] uppercase">
            Global Movement Stream
          </h2>
        </div>
        
        <div className="flex-1 font-mono text-[10px] leading-relaxed overflow-y-auto space-y-2">
          {overview.recentActivity.length === 0 ? (
            <div className="text-zinc-600">[SYS.LOG] No recent movements found.</div>
          ) : (
            overview.recentActivity.map((movement) => {
              const date = new Date(movement.createdAt).toISOString().replace("T", " ").substring(0, 19);
              const isPositive = movement.type === "RECEIVE";
              const isNegative = movement.type === "ISSUE";
              const colorClass = isPositive
                ? "text-emerald-400"
                : isNegative
                ? "text-rose-400"
                : "text-amber-400";
              const sign = isPositive ? "+" : isNegative ? "-" : "";

              return (
                <div key={movement.id} className="flex items-start gap-3 hover:bg-white/5 p-1 -mx-1 rounded-sm">
                  <span className="text-zinc-600 shrink-0">[{date}]</span>
                  <span className={`shrink-0 w-20 ${colorClass}`}>
                    [SYS.{movement.type.substring(0, 3)}]
                  </span>
                  <span className="text-zinc-400 flex-1 truncate">
                    <span className="text-zinc-300">ORG:</span> {movement.orgName} <span className="text-zinc-500 mx-1">|</span> 
                    <span className="text-zinc-300">ITEM:</span> {movement.itemName}
                  </span>
                  <span className={`font-bold shrink-0 text-right w-16 ${colorClass}`}>
                    {sign}{movement.quantity}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Action Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/10">
        <Link
          href="/admin/users"
          className="group flex flex-col justify-between bg-zinc-950 p-6 transition-none hover:bg-indigo-950/20"
        >
          <div>
            <p className="text-[12px] font-mono uppercase tracking-widest text-zinc-100 group-hover:text-indigo-400">[SYS.DIR] Users</p>
            <p className="mt-2 text-[10px] font-mono text-zinc-500">Inspect cross-org membership and role visibility.</p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-600 group-hover:text-indigo-500">
            <span>Initialize</span>
            <span aria-hidden="true">&rarr;</span>
          </div>
        </Link>

        <Link
          href="/admin/audit"
          className="group flex flex-col justify-between bg-zinc-950 p-6 transition-none hover:bg-indigo-950/20"
        >
          <div>
            <p className="text-[12px] font-mono uppercase tracking-widest text-zinc-100 group-hover:text-indigo-400">[SYS.MON] Audit</p>
            <p className="mt-2 text-[10px] font-mono text-zinc-500">Review movement history with bounded filters.</p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-600 group-hover:text-indigo-500">
            <span>Initialize</span>
            <span aria-hidden="true">&rarr;</span>
          </div>
        </Link>

        <Link
          href="/admin/exports"
          className="group flex flex-col justify-between bg-zinc-950 p-6 transition-none hover:bg-indigo-950/20"
        >
          <div>
            <p className="text-[12px] font-mono uppercase tracking-widest text-zinc-100 group-hover:text-indigo-400">[SYS.EXP] Exports</p>
            <p className="mt-2 text-[10px] font-mono text-zinc-500">Access monitoring export entrypoints.</p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-600 group-hover:text-indigo-500">
            <span>Initialize</span>
            <span aria-hidden="true">&rarr;</span>
          </div>
        </Link>
      </div>

      {/* Warning Banner */}
      <div className="bg-zinc-950 px-6 py-4 border-t-2 border-indigo-500/20">
        <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          [NOTICE] Monitoring views are read-only. User role management requires step-up authentication.
        </p>
      </div>
    </div>
  );
}
