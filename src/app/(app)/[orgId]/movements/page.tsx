import { MovementFilters, MovementList } from "@/features/movements";
import { getMovements } from "@/features/movements/server";
import { getItems } from "@/features/items/server";

interface PageProps {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MovementsPage({ params, searchParams }: PageProps) {
  const { orgId } = await params;
  const queryParams = await searchParams;

  const itemId = typeof queryParams.itemId === "string" ? queryParams.itemId : undefined;
  const from = typeof queryParams.from === "string" ? new Date(queryParams.from) : undefined;
  const to = typeof queryParams.to === "string" ? new Date(queryParams.to) : undefined;
  const page = Math.max(1, parseInt((queryParams.page as string) ?? "1", 10));
  const limit = 50;

  const [movementsData, items] = await Promise.all([
    getMovements(orgId, { itemId, from, to, page, limit }),
    getItems(orgId),
  ]);

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
              movements={movementsData.movements as any}
              pagination={movementsData.pagination}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
