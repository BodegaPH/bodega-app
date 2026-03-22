import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AmbientBackground from "@/app/components/auth/AmbientBackground";

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
        <div className="w-full max-w-[340px]">

          {children}

          <div className="mt-14 pt-8 border-t border-white/5">
            <p className="text-xs text-zinc-500 font-medium">
              Secure inventory management for the modern enterprise.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Ambient Visual */}
      <AmbientBackground />
    </div>
  );
}
