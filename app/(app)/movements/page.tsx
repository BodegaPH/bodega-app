import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import MovementList from "@/app/components/app/MovementList";
import MovementFilters from "@/app/components/app/MovementFilters";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MovementsPage({ searchParams }: PageProps) {
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

  const params = await searchParams;

  const itemId = typeof params.itemId === "string" ? params.itemId : undefined;
  const from = typeof params.from === "string" ? params.from : undefined;
  const to = typeof params.to === "string" ? params.to : undefined;
  const page = Math.max(1, parseInt((params.page as string) ?? "1", 10));
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
