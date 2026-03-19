import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireAuthWithOrg } from "@/lib/api-auth";
import { prisma } from "@/lib/db";

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

function isUniqueError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export async function GET() {
  const auth = await requireAuthWithOrg();
  if (!auth.success) {
    return auth.response;
  }

  const locations = await prisma.location.findMany({
    where: { orgId: auth.orgId },
    select: {
      id: true,
      name: true,
      isDefault: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });

  return NextResponse.json({ locations });
}

export async function POST(request: Request) {
  const auth = await requireAuthWithOrg();
  if (!auth.success) {
    return auth.response;
  }

  let body: { name?: unknown; isDefault?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const nameResult = validateName(body.name);
  if (!nameResult.ok) {
    return NextResponse.json({ error: nameResult.error }, { status: 400 });
  }

  const desiredDefault = Boolean(body.isDefault);

  const existingByName = await prisma.location.findFirst({
    where: {
      orgId: auth.orgId,
      name: { equals: nameResult.value, mode: "insensitive" },
    },
    select: { id: true },
  });

  if (existingByName) {
    return NextResponse.json(
      { error: "A location with this name already exists" },
      { status: 409 }
    );
  }

  try {
    const location = await prisma.$transaction(async (tx) => {
      const currentDefault = await tx.location.findFirst({
        where: { orgId: auth.orgId, isDefault: true },
        select: { id: true },
      });

      const makeDefault = desiredDefault || !currentDefault;

      if (makeDefault) {
        await tx.location.updateMany({
          where: { orgId: auth.orgId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.location.create({
        data: {
          orgId: auth.orgId,
          name: nameResult.value,
          isDefault: makeDefault,
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

    return NextResponse.json({ location }, { status: 201 });
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
