import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuthWithOrg: vi.fn(),
  addMember: vi.fn(),
  updateMemberRole: vi.fn(),
  removeMember: vi.fn(),
}));

vi.mock("@/lib/api-auth", () => ({
  requireAuthWithOrg: mocks.requireAuthWithOrg,
}));

vi.mock("@/features/organizations/server", async () => {
  const actual = await vi.importActual<typeof import("@/features/organizations/server")>(
    "@/features/organizations/server",
  );
  return {
    ...actual,
    addMember: mocks.addMember,
    updateMemberRole: mocks.updateMemberRole,
    removeMember: mocks.removeMember,
  };
});

import { DELETE, PATCH, POST } from "../route";

describe("org members route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuthWithOrg.mockResolvedValue({
      success: true,
      orgId: "org_1",
      session: { user: { id: "admin_1" } },
    });
  });

  it("returns 404 for cross-org member mutation", async () => {
    const req = new Request("http://localhost", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId: "u1" }),
    });

    const response = await DELETE(req as any, { params: Promise.resolve({ orgId: "org_2" }) });
    expect(response.status).toBe(404);
  });

  it("returns 400 for invalid role on member invite", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "member@example.com", role: "SUPER_ADMIN" }),
    });

    const response = await POST(req as any, { params: Promise.resolve({ orgId: "org_1" }) });
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid role" });
    expect(mocks.addMember).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid role on member role update", async () => {
    const req = new Request("http://localhost", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId: "u1", role: "SUPER_ADMIN" }),
    });

    const response = await PATCH(req as any, { params: Promise.resolve({ orgId: "org_1" }) });
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid role" });
    expect(mocks.updateMemberRole).not.toHaveBeenCalled();
  });
});
