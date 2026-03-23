import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import LocationList from "@/app/components/app/LocationList";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function LocationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Fetch user memberships to determine active org
  const memberships = await prisma.membership.findMany({
    where: { userId: session.user.id },
    select: { orgId: true },
  });

  if (memberships.length === 0) {
    redirect("/onboarding/create-org");
  }

  // Determine active org (same logic as layout)
  let orgId = session.user.activeOrgId;
  const userOrgIds = memberships.map((m) => m.orgId);
  
  if (!orgId || !userOrgIds.includes(orgId)) {
    orgId = userOrgIds[0];
  }

  const locations = await prisma.location.findMany({
    where: { orgId },
    select: {
      id: true,
      name: true,
      isDefault: true,
    },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <LocationList initialLocations={locations} />
    </div>
  );
}
