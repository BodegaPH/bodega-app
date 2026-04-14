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
          <h1 className="text-2xl font-semibold tracking-tight text-white">Generate Export</h1>
          <p className="mt-1 text-sm text-zinc-400">Select an export workflow to generate new reports.</p>
          <div className="mt-4 rounded-lg border border-white/5 bg-zinc-900/30 p-4 text-sm text-zinc-400 backdrop-blur-sm max-w-2xl">
            <span className="font-medium text-zinc-200">Note:</span> Data exports are context-dependent. Some datasets must be exported directly from their respective organization or audit views to ensure proper scoping.
          </div>
        </div>
        
        {entries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-zinc-900/40 px-6 py-14 text-center backdrop-blur-3xl">
            <h3 className="text-lg font-medium tracking-tight text-zinc-200">No exports available</h3>
            <p className="mt-2 text-sm text-zinc-500">Monitoring exports are currently not configured.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <Link
                key={entry.href}
                href={entry.href}
                className="group flex flex-col justify-between rounded-xl border border-white/5 bg-zinc-900/40 p-5 backdrop-blur-3xl transition hover:bg-zinc-800/60"
              >
                <div>
                  <p className="text-base font-medium text-zinc-100 group-hover:text-white">{entry.label}</p>
                  <p className="mt-2 text-sm text-zinc-400 line-clamp-2">{entry.description}</p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-blue-400 transition group-hover:text-blue-300">
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
          <h2 className="text-lg font-medium text-white">Recent Exports</h2>
          <p className="text-sm text-zinc-500">History of previously generated files</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-zinc-900/40 px-6 py-12 text-center backdrop-blur-3xl">
          <p className="text-sm text-zinc-500">No recent exports found.</p>
        </div>
      </div>
    </section>
  );
}
