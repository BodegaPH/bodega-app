import {
  Database,
  Building2,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

export default function FeaturesGrid() {
  return (
    <section id="features" className="px-6 py-24 max-w-7xl mx-auto w-full relative z-10">
      <div className="mb-16 text-center md:text-left">
        <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
          Designed for absolute truth.
        </h2>
        <p className="mt-4 text-lg text-zinc-400 max-w-xl">
          Spreadsheets break. Shared documents get overwritten. Bodega uses a strict append-only ledger so your data is mathematically bulletproof.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]">
        {/* Large Feature Card */}
        <div className="md:col-span-2 relative p-8 rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-white/5 overflow-hidden group hover:border-blue-500/30 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-6 text-blue-400">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Immutable Ledger</h3>
              <p className="text-zinc-400 max-w-md leading-relaxed">
                Never wonder where stock went. Every receive, issue, and adjustment is permanently recorded. The current stock is always a derivation of mathematical truth.
              </p>
            </div>
            <div className="mt-8 w-full bg-zinc-950/50 rounded-2xl border border-white/5 p-4 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs text-zinc-500 pb-2 border-b border-white/5 mb-2">
                <span>Movement ID</span>
                <span>Type</span>
                <span>Qty</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400 font-mono">mv_1a2b3c...</span>
                <span className="text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">RECEIVE</span>
                <span className="text-white">+500</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400 font-mono">mv_9x8y7z...</span>
                <span className="text-amber-400 bg-amber-400/10 px-2 py-1 rounded">ISSUE</span>
                <span className="text-white">-12</span>
              </div>
            </div>
          </div>
        </div>

        {/* Small Feature Card */}
        <div className="relative p-8 rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-white/5 overflow-hidden group hover:border-white/10 transition-colors">
           <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-zinc-300">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Multi-Org Native</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Manage multiple warehouses or businesses from a single account. Strict data isolation guarantees zero cross-org leakage.
              </p>
            </div>
          </div>
        </div>

        {/* Small Feature Card */}
        <div className="relative p-8 rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-white/5 overflow-hidden group hover:border-white/10 transition-colors">
           <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Real-time Stock</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Instant visibility into what you have, down to the exact unit and location. No manual tallying required.
              </p>
            </div>
          </div>
        </div>

        {/* Medium Feature Card */}
        <div className="md:col-span-2 relative p-8 rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-white/5 overflow-hidden group hover:border-white/10 transition-colors">
           <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center h-full">
              <div className="flex-1">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 text-purple-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Enterprise-grade Auth</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Secure sessions, encrypted credentials, and strict role-based access control. Give your team the exact permissions they need, nothing more.
                </p>
              </div>
              {/* Visual element */}
              <div className="flex-1 w-full bg-zinc-950/50 border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10" />
                  <div className="flex-1 h-3 rounded-full bg-white/10" />
                  <div className="px-2 py-1 text-[10px] font-medium rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">Admin</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10" />
                  <div className="flex-1 h-3 rounded-full bg-white/10" />
                  <div className="px-2 py-1 text-[10px] font-medium rounded-md bg-zinc-800 text-zinc-400 border border-white/5">User</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
