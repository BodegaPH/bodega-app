import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Redirect authenticated users to dashboard
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }
  
  return (
    <div className="min-h-screen w-full flex bg-zinc-950 text-white selection:bg-blue-500/30">
      {/* Left Column - Form Side */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-6 sm:p-12 xl:p-20 relative z-10">
        <div className="w-full max-w-[400px]">

          {children}

          <div className="mt-14 pt-8 border-t border-white/5">
            <p className="text-xs text-zinc-500 font-medium">
              Secure inventory management for the modern enterprise.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Ambient Visual */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden border-l border-white/5 bg-zinc-950">
        {/* Subtle geometric grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        
        {/* Abstract gradient meshes with refined animation */}
        <div className="absolute top-[10%] right-[10%] w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[120px] mix-blend-screen animate-[pulse_8s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-[10%] left-[10%] w-[700px] h-[700px] bg-indigo-600/15 rounded-full blur-[130px] mix-blend-screen animate-[pulse_12s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] mix-blend-screen animate-[pulse_10s_ease-in-out_infinite]"></div>

        {/* Floating Glass Element */}
        <div className="relative z-10 max-w-lg p-10 backdrop-blur-3xl bg-zinc-900/40 border border-white/5 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden group hover:bg-zinc-900/50 hover:-translate-y-1 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <div className="flex gap-4 mb-8 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.3)] group-hover:scale-105 group-hover:shadow-[0_0_40px_rgba(37,99,235,0.4)] transition-all duration-500">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-zinc-800/50 border border-white/5 flex items-center justify-center backdrop-blur-md transition-colors duration-500 group-hover:bg-zinc-800/80">
              <svg className="w-7 h-7 text-zinc-400 group-hover:text-zinc-300 transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          
          <h3 className="text-3xl font-semibold tracking-tight text-white mb-4 relative z-10">
            Precision Inventory Control
          </h3>
          <p className="text-zinc-400 text-lg leading-relaxed relative z-10 font-medium">
            Enterprise-grade stock tracking backed by an immutable ledger. 
            Built for organizations that demand absolute reliability and speed.
          </p>
          
          <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between relative z-10">
             <div className="flex -space-x-3">
               {[
                 { id: 1, z: "z-30", color: "from-blue-500/80 to-indigo-500/80" },
                 { id: 2, z: "z-20", color: "from-cyan-500/80 to-blue-500/80" },
                 { id: 3, z: "z-10", color: "from-indigo-500/80 to-purple-500/80" }
               ].map((item) => (
                 <div key={item.id} className={`w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center relative shadow-sm ${item.z}`}>
                   <div className={`w-full h-full rounded-full bg-gradient-to-br ${item.color}`}></div>
                 </div>
               ))}
               <div className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center relative z-0 text-xs font-semibold text-zinc-300 shadow-sm">
                 +12
               </div>
             </div>
             <span className="text-sm font-medium text-zinc-500">Trusted by modern teams</span>
          </div>
        </div>
      </div>
    </div>
  );
}
