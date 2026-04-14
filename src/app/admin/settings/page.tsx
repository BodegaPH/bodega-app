export default function AdminSettingsPage() {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-6 backdrop-blur-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Platform Settings
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400 sm:text-base">
          Configure platform-level policies, global controls, and governance settings for all
          organizations.
        </p>
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
          Settings controls are read-only for this MVP. Editable platform configuration options
          will be added in a future iteration.
        </div>
      </div>
    </section>
  );
}
