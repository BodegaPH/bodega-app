import { requirePlatformAdminAuth } from "@/lib/api-auth";
import { apiError } from "@/lib/api-errors";
import {
  getPlatformAdminMonitoringOverview,
  PlatformAdminMonitoringApiError,
} from "@/modules/admin";

export async function GET() {
  const auth = await requirePlatformAdminAuth();
  if (!auth.success) {
    return auth.response;
  }

  try {
    const overview = await getPlatformAdminMonitoringOverview();
    return Response.json({ overview });
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
