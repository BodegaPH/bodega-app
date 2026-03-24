import Link from "next/link";
import { ArrowLeftRight, ChevronRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative w-full flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 lg:pt-48 lg:pb-32 min-h-[90vh]">
      {/* Spotlight effect behind hero */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        <Link href="/auth/signup" className="group mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 hover:bg-zinc-800/80 border border-white/5 hover:border-white/10 text-xs sm:text-sm font-medium text-zinc-300 transition-all backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          <span className="text-zinc-400">Bodega MVP is now live.</span>
          <span className="text-white group-hover:text-blue-400 flex items-center transition-colors">
            Try it free <ChevronRight className="w-3 h-3 ml-1" />
          </span>
        </Link>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-5xl leading-[1.1]">
          Inventory management that{" "}
          <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            never loses track
          </span>
        </h1>

        <p className="mt-8 text-lg lg:text-xl text-zinc-400 max-w-2xl leading-relaxed">
          Track stock, manage movements, and keep your entire team in sync. 
          Built on a strictly immutable ledger so your inventory is always mathematically correct.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
          <Link
            href="/auth/signup"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-base font-semibold text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all active:scale-[0.98] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] flex items-center justify-center gap-2"
          >
            Start Building Free
            <ArrowLeftRight className="w-4 h-4" />
          </Link>
          <Link
            href="#features"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-zinc-900/40 hover:bg-zinc-800/60 backdrop-blur-xl border border-white/5 hover:border-white/10 text-base font-medium text-zinc-300 hover:text-white transition-all flex items-center justify-center"
          >
            Explore Features
          </Link>
        </div>
      </div>

      {/* Hero Visual Mockup */}
      <div className="relative mt-20 lg:mt-32 w-full max-w-6xl mx-auto perspective-[2000px]">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-20 pointer-events-none translate-y-24" />
        <div className="relative rounded-2xl border border-white/10 bg-zinc-950/50 backdrop-blur-3xl shadow-2xl overflow-hidden ring-1 ring-white/5 transform rotate-x-[5deg] scale-95 origin-bottom transition-transform duration-1000 ease-out hover:rotate-x-0 hover:scale-100">
          {/* Mockup Header */}
          <div className="h-12 border-b border-white/5 bg-zinc-900/50 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/50" />
            <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
          </div>
          {/* Mockup Content */}
          <div className="p-8 grid grid-cols-4 gap-6 opacity-80">
            <div className="col-span-1 space-y-4 hidden md:block">
              <div className="h-8 rounded bg-white/5 w-3/4" />
              <div className="h-4 rounded bg-white/5 w-1/2" />
              <div className="h-4 rounded bg-white/5 w-2/3" />
              <div className="h-4 rounded bg-white/5 w-1/2" />
            </div>
            <div className="col-span-4 md:col-span-3 space-y-4">
              <div className="flex gap-4 mb-8">
                <div className="h-24 rounded-xl border border-white/5 bg-white/5 flex-1" />
                <div className="h-24 rounded-xl border border-white/5 bg-white/5 flex-1" />
                <div className="h-24 rounded-xl border border-white/5 bg-white/5 flex-1" />
              </div>
              <div className="h-12 rounded bg-white/5 w-full" />
              <div className="h-12 rounded bg-white/5 w-full" />
              <div className="h-12 rounded bg-white/5 w-full" />
              <div className="h-12 rounded bg-white/5 w-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
