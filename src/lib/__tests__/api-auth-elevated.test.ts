import { beforeEach, describe, expect, it, vi } from "vitest";
import { issueStepUpToken } from "@/lib/platform-admin-security";

process.env.NEXTAUTH_SECRET = "test-nextauth-secret";

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  userFindUnique: vi.fn(),
}));

vi.mock("next-auth", () => ({
  getServerSession: mocks.getServerSession,
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: mocks.userFindUnique,
    },
    membership: {
      findUnique: vi.fn(),
    },
  },
}));

import { requireElevatedPlatformAdminAuth } from "@/lib/api-auth";

describe("requireElevatedPlatformAdminAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getServerSession.mockResolvedValue({
      user: { id: "admin_1", role: "PLATFORM_ADMIN", activeOrgId: null },
    });
    mocks.userFindUnique.mockResolvedValue({ updatedAt: new Date() });
  });

  it("requires step-up token", async () => {
    const req = new Request("http://localhost:3000/api/admin/users/u1/role", {
      method: "PATCH",
    });
    const result = await requireElevatedPlatformAdminAuth(req, "platform_admin.role_change");
    expect(result.success).toBe(false);
  });

  it("accepts valid non-expired token", async () => {
    const now = Date.now();
    const token = issueStepUpToken("admin_1", now);
    mocks.userFindUnique.mockResolvedValue({ updatedAt: new Date(now) });

    const req = new Request("http://localhost:3000/api/admin/users/u1/role", {
      method: "PATCH",
      headers: { cookie: `bodega_pa_step_up=${encodeURIComponent(token)}` },
    });
    const result = await requireElevatedPlatformAdminAuth(req, "platform_admin.role_change");
    expect(result.success).toBe(true);
  });

  it("invalidates elevated token when revoked by user update", async () => {
    const now = Date.now();
    const token = issueStepUpToken("admin_1", now);
    mocks.userFindUnique.mockResolvedValue({ updatedAt: new Date(now + 1000) });

    const req = new Request("http://localhost:3000/api/admin/users/u1/role", {
      method: "PATCH",
      headers: { cookie: `bodega_pa_step_up=${encodeURIComponent(token)}` },
    });
    const result = await requireElevatedPlatformAdminAuth(req, "platform_admin.role_change");
    expect(result.success).toBe(false);
  });
});
