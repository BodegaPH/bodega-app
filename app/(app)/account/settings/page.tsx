import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AccountSettingsForm from "@/app/components/app/AccountSettingsForm";
import PasswordChangeForm from "@/app/components/app/PasswordChangeForm";

export const metadata = {
  title: "Account Settings - Bodega",
  description: "Manage your personal account settings",
};

export default async function AccountSettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userId = (session.user as any).id;

  // Fetch full user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      password: true, // To check if user has password (non-OAuth)
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  const hasPassword = !!user.password;

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Account Settings</h1>
          <p className="text-sm text-zinc-400 mt-2">
            Manage your personal profile and security settings
          </p>
        </div>

        {/* Profile Section */}
        <div className="bg-zinc-900/40 backdrop-blur-3xl border border-white/5 rounded-2xl p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
          <h2 className="text-lg font-semibold text-white mb-6">Profile</h2>
          <AccountSettingsForm
            user={{
              name: user.name || "",
              email: user.email || "",
            }}
          />
        </div>

        {/* Password Section */}
        {hasPassword && (
          <div className="bg-zinc-900/40 backdrop-blur-3xl border border-white/5 rounded-2xl p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            <h2 className="text-lg font-semibold text-white mb-6">Password</h2>
            <PasswordChangeForm />
          </div>
        )}

        {/* OAuth Notice */}
        {!hasPassword && (
          <div className="bg-zinc-900/40 backdrop-blur-3xl border border-white/5 rounded-2xl p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            <h2 className="text-lg font-semibold text-white mb-2">Password</h2>
            <div className="bg-black/20 border border-white/10 rounded-xl p-4 mt-4">
              <p className="text-sm text-zinc-400 leading-relaxed">
                You signed in with an OAuth provider. Password management is not available for OAuth accounts.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
