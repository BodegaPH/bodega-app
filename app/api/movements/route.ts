import { NextResponse } from "next/server";
import { requireAuthWithOrg } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { MovementType } from "@prisma/client";

// ─── helpers ────────────────────────────────────────────────────────────────

function parseMovementType(value: unknown): MovementType | null {
  if (value === "RECEIVE" || value === "ISSUE" || value === "ADJUSTMENT") {
    return value;
  }
  return null;
}

function parseQuantity(value: unknown): { ok: true; value: number } | { ok: false; error: string } {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return { ok: false, error: "Quantity must be a number" };
  }
  return { ok: true, value: n };
}

// ─── POST /api/movements ─────────────────────────────────────────────────────

export async function POST(request: Request) {
  const auth = await requireAuthWithOrg();
  if (!auth.success) return auth.response;
  const { session, orgId } = auth;

  let body: {
    itemId?: unknown;
    locationId?: unknown;
    type?: unknown;
    quantity?: unknown;
    reason?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // ── validate type ──────────────────────────────────────────────────────────
  const movementType = parseMovementType(body.type);
  if (!movementType) {
    return NextResponse.json(
      { error: "type must be RECEIVE, ISSUE, or ADJUSTMENT" },
      { status: 400 }
    );
  }

  // ── validate quantity ──────────────────────────────────────────────────────
  const quantityResult = parseQuantity(body.quantity);
  if (!quantityResult.ok) {
    return NextResponse.json({ error: quantityResult.error }, { status: 400 });
  }

  const qty = quantityResult.value;

  // RECEIVE and ISSUE require quantity > 0
  if (movementType === "RECEIVE" || movementType === "ISSUE") {
    if (qty <= 0) {
      return NextResponse.json(
        { error: "Quantity must be greater than zero" },
        { status: 400 }
      );
    }
  }

  // ── validate reason for ADJUSTMENT ────────────────────────────────────────
  let reason: string | null = null;
  if (movementType === "ADJUSTMENT") {
    const rawReason = typeof body.reason === "string" ? body.reason.trim() : "";
    if (!rawReason) {
      return NextResponse.json(
        { error: "Reason is required for adjustments" },
        { status: 400 }
      );
    }
    reason = rawReason;
  }

  // ── validate itemId ────────────────────────────────────────────────────────
  if (typeof body.itemId !== "string" || !body.itemId) {
    return NextResponse.json({ error: "itemId is required" }, { status: 400 });
  }
  const itemId = body.itemId;

  // ── validate locationId ────────────────────────────────────────────────────
  if (typeof body.locationId !== "string" || !body.locationId) {
    return NextResponse.json({ error: "locationId is required" }, { status: 400 });
  }
  const locationId = body.locationId;

  // ── verify item belongs to org and is active ───────────────────────────────
  const item = await prisma.item.findFirst({
    where: { id: itemId, orgId },
    select: { id: true, isActive: true },
  });

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  if (!item.isActive) {
    return NextResponse.json(
      { error: "Cannot record movement for an inactive item" },
      { status: 400 }
    );
  }

  // ── verify location belongs to org ────────────────────────────────────────
  const location = await prisma.location.findFirst({
    where: { id: locationId, orgId },
    select: { id: true },
  });

  if (!location) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  // ── transactional movement creation ───────────────────────────────────────
  try {
    const movement = await prisma.$transaction(async (tx) => {
      // Lock the CurrentStock row (or do nothing if it doesn't exist yet)
      await tx.$queryRaw`
        SELECT id FROM "CurrentStock"
        WHERE "orgId" = ${orgId}
          AND "itemId" = ${itemId}
          AND "locationId" = ${locationId}
        FOR UPDATE
      `;

      // Read current quantity (0 if no row yet)
      const existing = await tx.currentStock.findUnique({
        where: { orgId_itemId_locationId: { orgId, itemId, locationId } },
        select: { quantity: true },
      });

      const currentQty = existing ? Number(existing.quantity) : 0;

      // Compute new quantity based on movement type
      let newQty: number;
      if (movementType === "RECEIVE") {
        newQty = currentQty + qty;
      } else if (movementType === "ISSUE") {
        newQty = currentQty - qty;
      } else {
        // ADJUSTMENT: qty is signed delta
        newQty = currentQty + qty;
      }

      // Reject if resulting quantity < 0
      if (newQty < 0) {
        throw new InsufficientStockError(
          movementType === "ISSUE"
            ? "Insufficient stock — cannot issue more than available quantity"
            : "Insufficient stock — adjustment would produce negative inventory"
        );
      }

      // Insert immutable Movement record
      const newMovement = await tx.movement.create({
        data: {
          orgId,
          itemId,
          locationId,
          createdById: session.user.id,
          type: movementType,
          quantity: Math.abs(qty),
          reason,
        },
        select: {
          id: true,
          type: true,
          quantity: true,
          reason: true,
          createdAt: true,
        },
      });

      // Upsert CurrentStock
      await tx.currentStock.upsert({
        where: { orgId_itemId_locationId: { orgId, itemId, locationId } },
        create: { orgId, itemId, locationId, quantity: newQty },
        update: { quantity: newQty },
      });

      return newMovement;
    });

    return NextResponse.json(
      {
        movement: {
          ...movement,
          quantity: movement.quantity.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}

// ─── GET /api/movements ───────────────────────────────────────────────────────

export async function GET(request: Request) {
  const auth = await requireAuthWithOrg();
  if (!auth.success) return auth.response;
  const { orgId } = auth;

  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get("itemId") ?? undefined;
  const locationId = searchParams.get("locationId") ?? undefined;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
  const skip = (page - 1) * limit;

  const where = {
    orgId,
    ...(itemId ? { itemId } : {}),
    ...(locationId ? { locationId } : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  };

  const [movements, total] = await Promise.all([
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
  ]);

  return NextResponse.json({
    movements: movements.map((m) => ({
      ...m,
      quantity: m.quantity.toString(),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// ─── custom error ─────────────────────────────────────────────────────────────

class InsufficientStockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientStockError";
  }
}
