import { NextResponse } from "next/server";
import { requireAuthWithOrg } from "@/lib/api-auth";
import { getInventory } from "@/features/inventory/server";

function parsePaginationParam(value: string | null, fallback: number, min: number, max: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, parsed));
}

export async function GET(request: Request) {
  const auth = await requireAuthWithOrg();
  if (!auth.success) return auth.response;
  const { orgId } = auth;

  // Get full inventory data from module
  const { inventory } = await getInventory(orgId);

  // Apply pagination from query params
  const { searchParams } = new URL(request.url);
  const page = parsePaginationParam(searchParams.get("page"), 1, 1, Number.MAX_SAFE_INTEGER);
  const limit = parsePaginationParam(searchParams.get("limit"), 50, 1, 100);
  const skip = (page - 1) * limit;

  const paginatedInventory = inventory.slice(skip, skip + limit);
  const total = inventory.length;

  return NextResponse.json({
    inventory: paginatedInventory,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
