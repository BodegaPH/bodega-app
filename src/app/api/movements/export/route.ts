import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  exportMovementsCsv,
  InvalidMovementExportFiltersError,
  MovementExportCapExceededError,
  MovementExportRateLimitedError,
  MovementExportServerError,
  MovementExportTimeoutError,
  type MovementExportRequest,
} from "@/features/movements/server";

const NON_ENUMERATING_MESSAGE = "Not found";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_FILTERS", message: "Invalid JSON body" } },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { error: { code: "INVALID_FILTERS", message: "Invalid request body" } },
      { status: 400 },
    );
  }

  const payload = body as Partial<MovementExportRequest>;

  const orgIdFromBody = (body as { orgId?: unknown }).orgId;
  if (typeof orgIdFromBody !== "string" || !orgIdFromBody.trim()) {
    return NextResponse.json(
      { error: { code: "INVALID_FILTERS", message: "orgId is required" } },
      { status: 400 },
    );
  }

  const normalizedOrgId = orgIdFromBody.trim();

  const membership = await prisma.membership.findUnique({
    where: {
      userId_orgId: {
        userId: session.user.id,
        orgId: normalizedOrgId,
      },
    },
    select: { role: true },
  });

  if (!membership || (membership.role !== "ORG_ADMIN" && membership.role !== "ORG_USER")) {
    return NextResponse.json({ error: { message: NON_ENUMERATING_MESSAGE } }, { status: 404 });
  }

  try {
    const result = await exportMovementsCsv(normalizedOrgId, session.user.id, {
      mode: payload.mode as MovementExportRequest["mode"],
      filters: payload.filters,
      confirmedAll: payload.confirmedAll,
    });

    return new Response(result.content, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${result.filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof InvalidMovementExportFiltersError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }

    if (error instanceof MovementExportCapExceededError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }

    if (error instanceof MovementExportTimeoutError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }

    if (error instanceof MovementExportRateLimitedError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
            retryAfterSeconds: error.retryAfterSeconds,
          },
        },
        {
          status: error.status,
          headers: { "Retry-After": String(error.retryAfterSeconds) },
        },
      );
    }

    const fallback = error instanceof MovementExportServerError
      ? error
      : new MovementExportServerError();

    return NextResponse.json(
      { error: { code: fallback.code, message: fallback.message } },
      { status: fallback.status },
    );
  }
}
