import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  findMany: vi.fn(),
}));

vi.mock("next-auth", () => ({
  getServerSession: mocks.getServerSession,
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    membership: {
      findMany: mocks.findMany,
    },
  },
}));

import { resolveCanonicalDestination } from "@/lib/redirect-helper";

describe("resolveCanonicalDestination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXTAUTH_URL = "http://localhost:3000";
  });

  it("redirects unauthenticated users to signin", async () => {
    mocks.getServerSession.mockResolvedValue(null);
    await expect(resolveCanonicalDestination()).resolves.toEqual({
      destination: "/auth/signin",
      routeClass: "auth",
    });
  });

  it("sends platform admins to /admin", async () => {
    mocks.getServerSession.mockResolvedValue({ user: { role: "PLATFORM_ADMIN", id: "u1" } });
    await expect(resolveCanonicalDestination()).resolves.toEqual({
      destination: "/admin",
      routeClass: "admin",
    });
  });

  it("sends org users with memberships to dashboard", async () => {
    mocks.getServerSession.mockResolvedValue({ user: { role: "USER", id: "u1", activeOrgId: null } });
    mocks.findMany.mockResolvedValue([{ orgId: "org_a" }]);

    await expect(resolveCanonicalDestination()).resolves.toEqual({
      destination: "/org_a/dashboard",
      routeClass: "org",
    });
  });

  it("sends users without orgs to onboarding", async () => {
    mocks.getServerSession.mockResolvedValue({ user: { role: "USER", id: "u1", activeOrgId: null } });
    mocks.findMany.mockResolvedValue([]);

    await expect(resolveCanonicalDestination()).resolves.toEqual({
      destination: "/onboarding/create-org",
      routeClass: "onboarding",
    });
  });

  it("handles stale active org by falling back to first valid membership", async () => {
    mocks.getServerSession.mockResolvedValue({ user: { role: "USER", id: "u1", activeOrgId: "stale" } });
    mocks.findMany.mockResolvedValue([{ orgId: "org_valid" }]);

    await expect(resolveCanonicalDestination()).resolves.toEqual({
      destination: "/org_valid/dashboard",
      routeClass: "org",
    });
  });

  it("allows safe internal callback and rejects external callback", async () => {
    mocks.getServerSession.mockResolvedValue({ user: { role: "USER", id: "u1", activeOrgId: null } });
    mocks.findMany.mockResolvedValue([{ orgId: "org_a" }]);

    await expect(
      resolveCanonicalDestination({ callbackUrl: "/org_a/items" }),
    ).resolves.toEqual({ destination: "/org_a/items", routeClass: "org" });

    await expect(
      resolveCanonicalDestination({ callbackUrl: "https://evil.com/admin" }),
    ).resolves.toEqual({ destination: "/org_a/dashboard", routeClass: "org" });
  });

  it("denies unauthorized admin callback attempts for org users", async () => {
    mocks.getServerSession.mockResolvedValue({ user: { role: "USER", id: "u1", activeOrgId: null } });
    mocks.findMany.mockResolvedValue([{ orgId: "org_a" }]);

    await expect(
      resolveCanonicalDestination({ callbackUrl: "/admin/users" }),
    ).resolves.toEqual({ destination: "/org_a/dashboard", routeClass: "org" });
  });

  it("prevents loops and falls back deterministically", async () => {
    mocks.getServerSession.mockResolvedValue({ user: { role: "USER", id: "u1", activeOrgId: null } });
    mocks.findMany.mockResolvedValue([{ orgId: "org_a" }]);

    await expect(
      resolveCanonicalDestination({ currentPath: "/org_a/dashboard" }),
    ).resolves.toEqual({ destination: "/org_a/dashboard", routeClass: "org" });
  });
});
