import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getMembers,
  getOrganizationOwner,
  listPendingInvitations,
} from "@/features/organizations/server";
import { OrganizationSettingsForm } from "@/features/organizations";
import { prisma } from "@/lib/db";

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

  const userId = session.user.id;

  // Fetch all user memberships (needed for isLastOrg check and role validation)
  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (memberships.length === 0) {
    redirect("/");
  }

  const membership = memberships.find(
    (m: { orgId: string }) => m.orgId === orgId,
  );

  if (!membership) {
    redirect("/");
  }

  // Only ORG_ADMIN can access organization settings
  if (membership.role !== "ORG_ADMIN") {
    redirect("/account/settings");
  }

  // Fetch organization members via feature server module
  const members = await getMembers(orgId);
  const owner = await getOrganizationOwner(orgId);
  const invites = await listPendingInvitations(orgId);

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">
            Organization Settings
          </h1>
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
            owner={owner}
            currentUserId={userId}
            members={members}
            invites={invites}
          />

        </div>
      </div>
    </div>
  );
}
