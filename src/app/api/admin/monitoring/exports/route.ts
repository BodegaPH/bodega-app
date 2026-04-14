import { requirePlatformAdminAuth } from "@/lib/api-auth";
import { apiError } from "@/lib/api-errors";
import {
  getPlatformAdminMonitoringExports,
  PlatformAdminMonitoringApiError,
} from "@/modules/admin";

export async function GET() {
  const auth = await requirePlatformAdminAuth();
  if (!auth.success) {
    return auth.response;
  }

  try {
    const exportsEntries = getPlatformAdminMonitoringExports();
    return Response.json({ entries: exportsEntries });
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
