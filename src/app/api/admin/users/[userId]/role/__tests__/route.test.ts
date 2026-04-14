import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireElevatedPlatformAdminAuth: vi.fn(),
  isSensitivePlatformAdminAction: vi.fn(),
  logPlatformSecurityAudit: vi.fn(),
  userUpdate: vi.fn(),
}));

vi.mock("@/lib/api-auth", () => ({
  requireElevatedPlatformAdminAuth: mocks.requireElevatedPlatformAdminAuth,
}));

vi.mock("@/lib/platform-admin-security", () => ({
  isSensitivePlatformAdminAction: mocks.isSensitivePlatformAdminAction,
  logPlatformSecurityAudit: mocks.logPlatformSecurityAudit,
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      update: mocks.userUpdate,
    },
  },
}));

import { PATCH } from "../route";

describe("admin user role route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isSensitivePlatformAdminAction.mockReturnValue(true);
    mocks.requireElevatedPlatformAdminAuth.mockResolvedValue({
      success: true,
      session: { user: { id: "admin_1" } },
    });
  });

  it("blocks platform admin self-demotion to USER", async () => {
    const request = new Request("http://localhost/api/admin/users/admin_1/role", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role: "USER" }),
    });

    const response = await PATCH(request as never, { params: Promise.resolve({ userId: "admin_1" }) });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Platform admins cannot demote their own account",
    });
    expect(mocks.userUpdate).not.toHaveBeenCalled();
  });

  it("rejects unsupported role payload values", async () => {
    const request = new Request("http://localhost/api/admin/users/user_2/role", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role: "SYSTEM_ADMIN" }),
    });

    const response = await PATCH(request as never, { params: Promise.resolve({ userId: "user_2" }) });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Role must be exactly one of: USER, PLATFORM_ADMIN",
    });
    expect(mocks.userUpdate).not.toHaveBeenCalled();
  });
});
