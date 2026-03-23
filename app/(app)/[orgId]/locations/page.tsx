import LocationList from "@/app/components/app/LocationList";
import { prisma } from "@/lib/db";

export default async function LocationsPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;

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
