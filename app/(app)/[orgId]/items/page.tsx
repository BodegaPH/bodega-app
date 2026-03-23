import ItemList from "@/app/components/app/ItemList";
import { prisma } from "@/lib/db";

export default async function ItemsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;

  const items = await prisma.item.findMany({
    where: { orgId, isActive: true },
    select: {
      id: true,
      name: true,
      sku: true,
      unit: true,
      category: true,
      isActive: true,
      lowStockThreshold: true,
    },
    orderBy: [{ name: "asc" }],
  });

  const serializedItems = items.map((item) => ({
    ...item,
    lowStockThreshold: item.lowStockThreshold?.toString() ?? null,
  }));

  return (
    <div className="space-y-6">
      <ItemList initialItems={serializedItems} />
    </div>
  );
}
