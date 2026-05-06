import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { redirectByCanonicalPolicy } from "@/lib/redirect-helper";
import { isPlatformAdminRole } from "@/lib/system-role";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AppHeader from "@/components/layout/AppHeader";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin?callbackUrl=%2Fadmin");
  }

  if (!isPlatformAdminRole(session.user.role)) {
    await redirectByCanonicalPolicy({ currentPath: "/admin" });
  }

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden text-zinc-300 font-sans selection:bg-indigo-500/30">
      <AdminSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <AppHeader user={session.user} />
        <main className="flex-1 overflow-auto bg-zinc-950 p-6">
          <div className="mx-auto max-w-5xl h-full flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
