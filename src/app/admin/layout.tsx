import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { redirectByCanonicalPolicy } from "@/lib/redirect-helper";
import { isPlatformAdminRole } from "@/lib/system-role";

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
        {children}
      </div>
    </div>
  );
}
