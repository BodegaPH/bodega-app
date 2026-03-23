import { prisma } from "@/lib/db";
import MovementList from "@/app/components/app/MovementList";
import MovementFilters from "@/app/components/app/MovementFilters";

interface PageProps {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MovementsPage({ params, searchParams }: PageProps) {
  const { orgId } = await params;

  const queryParams = await searchParams;

  const itemId = typeof queryParams.itemId === "string" ? queryParams.itemId : undefined;
  const from = typeof queryParams.from === "string" ? queryParams.from : undefined;
  const to = typeof queryParams.to === "string" ? queryParams.to : undefined;
  const page = Math.max(1, parseInt((queryParams.page as string) ?? "1", 10));
  const limit = 50;
  const skip = (page - 1) * limit;

  const where = {
    orgId,
    ...(itemId ? { itemId } : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  };

  const [movements, total, items] = await Promise.all([
    prisma.movement.findMany({
      where,
      select: {
        id: true,
        type: true,
        quantity: true,
        reason: true,
        createdAt: true,
        item: { select: { id: true, name: true, sku: true, unit: true } },
        location: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.movement.count({ where }),
    prisma.item.findMany({
      where: { orgId, isActive: true },
      select: { id: true, name: true, sku: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Movement History</h1>
          <p className="mt-2 text-sm text-zinc-400">
            View the complete immutable ledger of all stock movements.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="w-full">
            <MovementFilters items={items} />
          </div>

          <div className="w-full">
            <MovementList
              movements={movements.map((m) => ({
                ...m,
                quantity: m.quantity.toString(),
                createdAt: m.createdAt.toISOString(),
              }))}
              pagination={{
                page,
                limit,
                total,
                totalPages,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
