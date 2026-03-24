export default function StepsSection() {
  return (
    <section className="px-6 py-24 w-full border-t border-white/5 bg-zinc-950/50 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
            From zero to managed in minutes
          </h2>
          <p className="mt-4 text-zinc-400">A streamlined workflow designed to get out of your way.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {[
            {
              step: "01",
              title: "Create your org",
              description: "Sign up and establish your organization workspace securely."
            },
            {
              step: "02",
              title: "Define catalog",
              description: "Map out your physical spaces and the items you need to track."
            },
            {
              step: "03",
              title: "Record movements",
              description: "Start receiving, issuing, and adjusting stock with full accountability."
            }
          ].map((s, i) => (
            <div key={i} className="relative flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mb-6 relative z-10 shadow-xl">
                <span className="text-2xl font-bold text-white/50">{s.step}</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{s.title}</h3>
              <p className="text-zinc-400 leading-relaxed max-w-xs">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
