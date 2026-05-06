import Link from "next/link";
import type { MonitoringExportEntryDto } from "@/features/admin/server";

interface AdminExportsPanelProps {
  entries: MonitoringExportEntryDto[];
}

export default function AdminExportsPanel({ entries }: AdminExportsPanelProps) {
  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4">
        <div className="px-2">
          <h1 className="text-2xl font-mono uppercase tracking-widest text-white">[SYS.EXP] Generate Export</h1>
          <p className="mt-2 text-[12px] font-mono text-zinc-400">Select an export workflow to generate new reports.</p>
          <div className="mt-4 rounded-none border border-white/10 bg-zinc-950 p-4 text-[10px] font-mono uppercase tracking-widest text-zinc-400 max-w-2xl">
            <span className="font-semibold text-zinc-200">[NOTE]</span> Data exports are context-dependent. Some datasets must be exported directly from their respective organization or audit views to ensure proper scoping.
          </div>
        </div>
        
        {entries.length === 0 ? (
          <div className="rounded-none border border-dashed border-white/10 bg-zinc-950 px-6 py-14 text-center">
            <h3 className="text-[12px] font-mono uppercase tracking-widest text-zinc-200">No exports available</h3>
            <p className="mt-2 text-[10px] font-mono text-zinc-500">Monitoring exports are currently not configured.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <Link
                key={entry.href}
                href={entry.href}
                className="group flex flex-col justify-between rounded-none border border-white/10 bg-zinc-950 p-5 transition-none hover:bg-white/5"
              >
                <div>
                  <p className="text-[12px] font-mono uppercase tracking-widest text-zinc-100 group-hover:text-white">{entry.label}</p>
                  <p className="mt-2 text-[10px] font-mono text-zinc-400 line-clamp-2">{entry.description}</p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-indigo-400 transition-none group-hover:text-indigo-300">
                  <span>Start workflow</span>
                  <span aria-hidden="true">&rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4 pt-6 border-t border-white/5">
        <div className="px-2">
          <h2 className="text-[12px] font-mono uppercase tracking-widest text-white">Recent Exports</h2>
          <p className="text-[10px] font-mono text-zinc-500 mt-2">History of previously generated files</p>
        </div>
        <div className="rounded-none border border-white/10 bg-zinc-950 px-6 py-12 text-center">
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">No recent exports found.</p>
        </div>
      </div>
    </section>
  );
}
