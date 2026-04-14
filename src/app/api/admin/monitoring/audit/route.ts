import type { MovementType } from "@prisma/client";
import { requirePlatformAdminAuth } from "@/lib/api-auth";
import { apiError } from "@/lib/api-errors";
import {
  getPlatformAdminMonitoringAudit,
  PlatformAdminMonitoringApiError,
  type MonitoringAuditSortField,
  type MonitoringSortOrder,
} from "@/modules/admin";

function parseIntQuery(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return NaN;
  }

  return parsed;
}

function parseDateQuery(value: string | null, field: "from" | "to"): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new PlatformAdminMonitoringApiError(
      `${field} must be a valid ISO date`,
      400,
      "VALIDATION_ERROR",
      { field },
    );
  }

  return parsed;
}

function parseMovementType(value: string | null): MovementType | undefined {
  if (!value) {
    return undefined;
  }

  if (value === "RECEIVE" || value === "ISSUE" || value === "ADJUSTMENT") {
    return value;
  }

  throw new PlatformAdminMonitoringApiError(
    "type must be one of: RECEIVE, ISSUE, ADJUSTMENT",
    400,
    "VALIDATION_ERROR",
    { field: "type", allowed: ["RECEIVE", "ISSUE", "ADJUSTMENT"] },
  );
}

function parseSortBy(value: string | null): MonitoringAuditSortField | undefined {
  if (!value) {
    return undefined;
  }

  if (value === "createdAt") {
    return value;
  }

  throw new PlatformAdminMonitoringApiError(
    "sortBy must be one of: createdAt",
    400,
    "VALIDATION_ERROR",
    { field: "sortBy", allowed: ["createdAt"] },
  );
}

function parseSortOrder(value: string | null): MonitoringSortOrder | undefined {
  if (!value) {
    return undefined;
  }

  if (value === "asc" || value === "desc") {
    return value;
  }

  throw new PlatformAdminMonitoringApiError(
    "sortOrder must be one of: asc, desc",
    400,
    "VALIDATION_ERROR",
    { field: "sortOrder", allowed: ["asc", "desc"] },
  );
}

export async function GET(request: Request) {
  const auth = await requirePlatformAdminAuth();
  if (!auth.success) {
    return auth.response;
  }

  try {
    const url = new URL(request.url);

    const audit = await getPlatformAdminMonitoringAudit({
      page: parseIntQuery(url.searchParams.get("page")),
      pageSize: parseIntQuery(url.searchParams.get("pageSize")),
      from: parseDateQuery(url.searchParams.get("from"), "from"),
      to: parseDateQuery(url.searchParams.get("to"), "to"),
      type: parseMovementType(url.searchParams.get("type")),
      orgId: url.searchParams.get("orgId") ?? undefined,
      itemId: url.searchParams.get("itemId") ?? undefined,
      locationId: url.searchParams.get("locationId") ?? undefined,
      sortBy: parseSortBy(url.searchParams.get("sortBy")),
      sortOrder: parseSortOrder(url.searchParams.get("sortOrder")),
    });

    return Response.json(audit);
  } catch (error) {
    if (error instanceof PlatformAdminMonitoringApiError) {
      return apiError(error.message, error.status, {
        code: error.code,
        details: error.details,
      });
    }

    return apiError("Internal server error", 500);
  }
}
