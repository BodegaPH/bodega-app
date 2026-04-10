import { SignOutButton } from "@/features/auth";

export default function AdminPage() {
  return (
    <section className="rounded-2xl border border-white/5 bg-zinc-900/40 p-8 backdrop-blur-3xl">
      <div className="flex items-start justify-between gap-4">
        <div className="inline-flex items-center rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-blue-200">
          Platform Admin
        </div>
        <SignOutButton />
      </div>

      <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Admin Control Surface
      </h1>

      <p className="mt-3 max-w-2xl text-sm text-zinc-400 sm:text-base">
        Minimal bootstrap route for platform administrators. This endpoint now resolves
        correctly and can be expanded with admin tools incrementally.
      </p>

      <div className="mt-8 h-px w-full bg-gradient-to-r from-blue-500/40 via-fuchsia-500/30 to-transparent" />
    </section>
  );
}
