import type { SystemRole } from "@prisma/client";
import { requirePlatformAdminAuth } from "@/lib/api-auth";
import { apiError } from "@/lib/api-errors";
import {
  getPlatformAdminMonitoringUsers,
  PlatformAdminMonitoringApiError,
  type MonitoringSortOrder,
  type MonitoringUsersSortField,
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

function parseSystemRole(value: string | null): SystemRole | undefined {
  if (!value) {
    return undefined;
  }

  if (value === "USER" || value === "SYSTEM_ADMIN" || value === "PLATFORM_ADMIN") {
    return value;
  }

  throw new PlatformAdminMonitoringApiError(
    "systemRole must be one of: USER, SYSTEM_ADMIN, PLATFORM_ADMIN",
    400,
    "VALIDATION_ERROR",
    { field: "systemRole", allowed: ["USER", "SYSTEM_ADMIN", "PLATFORM_ADMIN"] },
  );
}

function parseSortBy(value: string | null): MonitoringUsersSortField | undefined {
  if (!value) {
    return undefined;
  }

  if (value === "joinedAt" || value === "email") {
    return value;
  }

  throw new PlatformAdminMonitoringApiError(
    "sortBy must be one of: joinedAt, email",
    400,
    "VALIDATION_ERROR",
    { field: "sortBy", allowed: ["joinedAt", "email"] },
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

    const users = await getPlatformAdminMonitoringUsers({
      page: parseIntQuery(url.searchParams.get("page")),
      pageSize: parseIntQuery(url.searchParams.get("pageSize")),
      orgId: url.searchParams.get("orgId") ?? undefined,
      actorUserId: auth.session.user.id,
      systemRole: parseSystemRole(url.searchParams.get("systemRole")),
      sortBy: parseSortBy(url.searchParams.get("sortBy")),
      sortOrder: parseSortOrder(url.searchParams.get("sortOrder")),
    });

    return Response.json(users);
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
