import { ItemList } from "@/features/items";
import { getItems } from "@/features/items/server";

export default async function ItemsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const items = await getItems(orgId);

  return (
    <div className="space-y-6">
      <ItemList initialItems={items} />
    </div>
  );
}
