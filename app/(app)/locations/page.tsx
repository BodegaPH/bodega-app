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

  if (!session.user.activeOrgId) {
    redirect("/onboarding/create-org");
  }

  const locations = await prisma.location.findMany({
    where: { orgId: session.user.activeOrgId },
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
