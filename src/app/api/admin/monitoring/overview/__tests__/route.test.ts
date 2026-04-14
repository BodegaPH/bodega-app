import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requirePlatformAdminAuth: vi.fn(),
  getPlatformAdminMonitoringOverview: vi.fn(),
}));

vi.mock("@/lib/api-auth", () => ({
  requirePlatformAdminAuth: mocks.requirePlatformAdminAuth,
}));

vi.mock("@/modules/admin", async () => {
  const actual = await vi.importActual<typeof import("@/modules/admin")>(
    "@/modules/admin",
  );

  return {
    ...actual,
    getPlatformAdminMonitoringOverview: mocks.getPlatformAdminMonitoringOverview,
  };
});

import { GET } from "../route";

describe("admin monitoring overview route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies non-platform-admin access", async () => {
    mocks.requirePlatformAdminAuth.mockResolvedValue({
      success: false,
      response: Response.json({ error: { message: "Forbidden" } }, { status: 403 }),
    });

    const response = await GET();

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: { message: "Forbidden" } });
    expect(mocks.getPlatformAdminMonitoringOverview).not.toHaveBeenCalled();
  });
});
