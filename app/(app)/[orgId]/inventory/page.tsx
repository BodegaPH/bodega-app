import { prisma } from "@/lib/db";
import InventoryList from "@/app/components/app/InventoryList";

export default async function InventoryPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;

  // Fetch inventory
  const inventory = await prisma.currentStock.findMany({
    where: { orgId },
    select: {
      id: true,
      quantity: true,
      updatedAt: true,
      item: {
        select: {
          id: true,
          name: true,
          sku: true,
          unit: true,
          category: true,
          lowStockThreshold: true,
        },
      },
      location: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      item: { name: "asc" },
    },
  });

  // Fetch active items for movement form
  const items = await prisma.item.findMany({
    where: { orgId, isActive: true },
    select: { id: true, name: true, sku: true, unit: true },
    orderBy: { name: "asc" },
  });

  // Fetch locations for movement form
  const locations = await prisma.location.findMany({
    where: { orgId },
    select: { id: true, name: true, isDefault: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <InventoryList
          inventory={inventory.map((row) => ({
            id: row.id,
            quantity: row.quantity.toString(),
            item: {
              ...row.item,
              lowStockThreshold: row.item.lowStockThreshold?.toString() ?? null,
            },
            location: row.location,
          }))}
          items={items}
          locations={locations}
        />
      </div>
    </div>
  );
}
