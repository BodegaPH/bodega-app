import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requirePlatformAdminAuth: vi.fn(),
  getPlatformAdminMonitoringUsers: vi.fn(),
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
    getPlatformAdminMonitoringUsers: mocks.getPlatformAdminMonitoringUsers,
  };
});

import { GET } from "../route";

describe("admin monitoring users route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies non-platform-admin access", async () => {
    mocks.requirePlatformAdminAuth.mockResolvedValue({
      success: false,
      response: Response.json({ error: { message: "Forbidden" } }, { status: 403 }),
    });

    const response = await GET(new Request("http://localhost/api/admin/monitoring/users"));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: { message: "Forbidden" } });
    expect(mocks.getPlatformAdminMonitoringUsers).not.toHaveBeenCalled();
  });

  it("enforces actor self-exclusion from auth session", async () => {
    mocks.requirePlatformAdminAuth.mockResolvedValue({
      success: true,
      session: { user: { id: "actor_1" } },
    });
    mocks.getPlatformAdminMonitoringUsers.mockResolvedValue({
      rows: [],
      pagination: { page: 1, pageSize: 25, total: 0, totalPages: 1 },
    });

    const response = await GET(
      new Request(
        "http://localhost/api/admin/monitoring/users?excludeUserId=other_user&page=2&systemRole=USER",
      ),
    );

    expect(response.status).toBe(200);
    expect(mocks.getPlatformAdminMonitoringUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        actorUserId: "actor_1",
      }),
    );
    expect(mocks.getPlatformAdminMonitoringUsers).not.toHaveBeenCalledWith(
      expect.objectContaining({ excludeUserId: "other_user" }),
    );
  });
});
