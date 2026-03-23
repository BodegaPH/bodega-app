import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import OrganizationSettingsForm from "@/app/components/app/OrganizationSettingsForm";
import MemberList from "@/app/components/app/MemberList";

export const metadata = {
  title: "Organization Settings - Bodega",
  description: "Manage your organization settings",
};

export default async function OrganizationSettingsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userId = (session.user as any).id;

  // Fetch all user memberships
  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: {
      organization: true,
    },
  });

  if (memberships.length === 0) {
    redirect("/dashboard");
  }

  const membership = memberships.find((m) => m.orgId === orgId);

  if (!membership) {
    redirect("/dashboard");
  }

  // Only ORG_ADMIN can access organization settings
  if (membership.role !== "ORG_ADMIN") {
    redirect("/account/settings");
  }

  // Fetch organization members
  const members = await prisma.membership.findMany({
    where: {
      orgId: orgId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      role: "desc", // ORG_ADMIN first
    },
  });

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Organization Settings</h1>
          <p className="text-sm text-zinc-400 mt-2">
            Manage organization details and members
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-8">
          <OrganizationSettingsForm
            organization={{
              id: membership.organization.id,
              name: membership.organization.name,
            }}
            isLastOrg={memberships.length === 1}
          />

          {/* Members Section */}
          <div className="bg-zinc-900/40 backdrop-blur-3xl border border-white/5 rounded-2xl p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">Members</h2>
                <p className="text-sm text-zinc-400 mt-1">People with access to this organization</p>
              </div>
            </div>
            <MemberList
              members={members.map((m) => ({
                id: m.user.id,
                name: m.user.name,
                email: m.user.email,
                role: m.role,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
