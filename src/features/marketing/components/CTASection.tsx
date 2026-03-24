import Link from "next/link";
import { Zap, ChevronRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="px-6 py-32 w-full relative z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/10 pointer-events-none" />
      <div className="relative max-w-4xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 mb-4 shadow-[0_0_30px_rgba(37,99,235,0.2)]">
          <Zap className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          Ready to take control?
        </h2>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
          Join Bodega today and never second-guess your inventory levels again. Simple setup, powerful scaling.
        </p>
        <div className="pt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-lg font-semibold text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all active:scale-[0.98] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)]"
          >
            Get Started for Free
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
