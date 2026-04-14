import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { redirectByCanonicalPolicy } from "@/lib/redirect-helper";
import { isPlatformAdminRole } from "@/lib/system-role";
import SignOutButton from "@/features/auth/components/SignOutButton";

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
        <nav className="mb-6 flex flex-wrap items-center justify-between rounded-xl border border-white/5 bg-zinc-900/40 p-2 text-sm backdrop-blur-3xl">
          <div className="flex gap-2">
            <Link href="/admin" className="rounded-md px-3 py-1.5 text-zinc-300 hover:bg-white/5">
              Overview
            </Link>
            <Link href="/admin/users" className="rounded-md px-3 py-1.5 text-zinc-300 hover:bg-white/5">
              Users
            </Link>
            <Link
              href="/admin/organizations"
              className="rounded-md px-3 py-1.5 text-zinc-300 hover:bg-white/5"
            >
              Organizations
            </Link>
            <Link href="/admin/audit" className="rounded-md px-3 py-1.5 text-zinc-300 hover:bg-white/5">
              Audit
            </Link>
            <Link href="/admin/exports" className="rounded-md px-3 py-1.5 text-zinc-300 hover:bg-white/5">
              Exports
            </Link>
            <Link
              href="/admin/settings"
              className="rounded-md px-3 py-1.5 text-zinc-300 hover:bg-white/5"
            >
              Settings
            </Link>
          </div>
          <div className="flex px-1">
            <SignOutButton />
          </div>
        </nav>
        {children}
      </div>
    </div>
  );
}
