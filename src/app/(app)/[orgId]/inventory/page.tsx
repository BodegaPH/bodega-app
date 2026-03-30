import { InventoryList } from "@/features/inventory";
import { getInventory } from "@/features/inventory/server";

export default async function InventoryPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const { inventory, items, locations } = await getInventory(orgId);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <InventoryList
          inventory={inventory}
          items={items}
          locations={locations}
        />
      </div>
    </div>
  );
}
