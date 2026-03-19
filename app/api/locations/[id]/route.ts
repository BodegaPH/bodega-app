import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireAuthWithOrg } from "@/lib/api-auth";
import { prisma } from "@/lib/db";

function isUniqueError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function validateName(name: unknown) {
  if (typeof name !== "string") {
    return { ok: false as const, error: "Location name is required" };
  }

  const trimmed = name.trim();
  if (!trimmed) {
    return { ok: false as const, error: "Location name is required" };
  }

  if (trimmed.length > 100) {
    return {
      ok: false as const,
      error: "Location name must be 100 characters or fewer",
    };
  }

  return { ok: true as const, value: trimmed };
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAuthWithOrg();
  if (!auth.success) {
    return auth.response;
  }

  const { id } = await context.params;

  let body: { name?: unknown; isDefault?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const hasName = Object.prototype.hasOwnProperty.call(body, "name");
  const hasIsDefault = Object.prototype.hasOwnProperty.call(body, "isDefault");

  if (!hasName && !hasIsDefault) {
    return NextResponse.json(
      { error: "No valid fields provided for update" },
      { status: 400 }
    );
  }

  const location = await prisma.location.findFirst({
    where: { id, orgId: auth.orgId },
    select: { id: true, name: true, isDefault: true },
  });

  if (!location) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  let nextName: string | undefined;
  if (hasName) {
    const nameResult = validateName(body.name);
    if (!nameResult.ok) {
      return NextResponse.json({ error: nameResult.error }, { status: 400 });
    }

    const duplicate = await prisma.location.findFirst({
      where: {
        orgId: auth.orgId,
        id: { not: id },
        name: { equals: nameResult.value, mode: "insensitive" },
      },
      select: { id: true },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "A location with this name already exists" },
        { status: 409 }
      );
    }

    nextName = nameResult.value;
  }

  if (hasIsDefault && typeof body.isDefault !== "boolean") {
    return NextResponse.json(
      { error: "isDefault must be a boolean" },
      { status: 400 }
    );
  }

  if (body.isDefault === false && location.isDefault) {
    return NextResponse.json(
      { error: "A default location is required" },
      { status: 409 }
    );
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      if (body.isDefault === true) {
        await tx.location.updateMany({
          where: { orgId: auth.orgId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.location.update({
        where: { id },
        data: {
          ...(nextName !== undefined ? { name: nextName } : {}),
          ...(body.isDefault === true ? { isDefault: true } : {}),
        },
        select: {
          id: true,
          name: true,
          isDefault: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    return NextResponse.json({ location: updated });
  } catch (error) {
    if (isUniqueError(error)) {
      return NextResponse.json(
        { error: "A location with this name already exists" },
        { status: 409 }
      );
    }

    throw error;
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAuthWithOrg();
  if (!auth.success) {
    return auth.response;
  }

  const { id } = await context.params;

  const location = await prisma.location.findFirst({
    where: { id, orgId: auth.orgId },
    select: { id: true, isDefault: true, name: true },
  });

  if (!location) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  if (location.isDefault) {
    return NextResponse.json(
      { error: "Default location cannot be deleted" },
      { status: 409 }
    );
  }

  const stockCount = await prisma.currentStock.count({
    where: {
      orgId: auth.orgId,
      locationId: id,
    },
  });

  if (stockCount > 0) {
    return NextResponse.json(
      { error: "Location cannot be deleted because stock exists" },
      { status: 409 }
    );
  }

  await prisma.location.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
