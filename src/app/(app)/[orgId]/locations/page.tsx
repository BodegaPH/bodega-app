import { LocationList } from "@/features/locations";
import { getLocations } from "@/features/locations/server";

export default async function LocationsPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const locations = await getLocations(orgId);

  return (
    <div className="space-y-6">
      <LocationList initialLocations={locations} />
    </div>
  );
}
