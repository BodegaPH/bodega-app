import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  membershipFindUnique: vi.fn(),
  exportMovementsCsv: vi.fn(),
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
      findUnique: mocks.membershipFindUnique,
    },
  },
}));

vi.mock("@/features/movements/server", async () => {
  const actual = await vi.importActual<typeof import("@/features/movements/server")>(
    "@/features/movements/server",
  );
  return {
    ...actual,
    exportMovementsCsv: mocks.exportMovementsCsv,
  };
});

import { POST } from "../route";
import {
  InvalidMovementExportFiltersError,
  MovementExportRateLimitedError,
} from "@/features/movements/server";

describe("movements export route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getServerSession.mockResolvedValue({ user: { id: "user_1" } });
    mocks.membershipFindUnique.mockResolvedValue({ role: "ORG_USER" });
    mocks.exportMovementsCsv.mockResolvedValue({
      filename: "movement-ledger-org_1-2026-04-13.csv",
      content: "\uFEFFa,b",
      rowCount: 1,
      generatedAt: "2026-04-13T00:00:00.000Z",
    });
  });

  it("denies unauthenticated users", async () => {
    mocks.getServerSession.mockResolvedValue(null);

    const res = await POST(
      new Request("http://localhost/api/movements/export", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orgId: "org_1", mode: "filtered", filters: {} }),
      }),
    );

    expect(res.status).toBe(401);
  });

  it("returns non-enumerating not found for non-members", async () => {
    mocks.membershipFindUnique.mockResolvedValue(null);

    const res = await POST(
      new Request("http://localhost/api/movements/export", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orgId: "org_2", mode: "filtered", filters: {} }),
      }),
    );

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({ error: { message: "Not found" } });
  });

  it("returns success for authorized members", async () => {
    const res = await POST(
      new Request("http://localhost/api/movements/export", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          orgId: "org_1",
          mode: "filtered",
          filters: { itemId: "item_1" },
        }),
      }),
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/csv");
    expect(res.headers.get("content-disposition")).toBe(
      "attachment; filename=\"movement-ledger-org_1-2026-04-13.csv\"",
    );
    await expect(res.text()).resolves.toBe("a,b");
    expect(mocks.exportMovementsCsv).toHaveBeenCalledWith("org_1", "user_1", {
      mode: "filtered",
      filters: { itemId: "item_1" },
      confirmedAll: undefined,
    });
  });

  it("enforces broad export confirmation", async () => {
    mocks.exportMovementsCsv.mockRejectedValue(
      new InvalidMovementExportFiltersError("Broad export requires explicit confirmation"),
    );

    const res = await POST(
      new Request("http://localhost/api/movements/export", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orgId: "org_1", mode: "all", confirmedAll: false }),
      }),
    );

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      error: {
        code: "INVALID_FILTERS",
        message: "Broad export requires explicit confirmation",
      },
    });
  });

  it("returns retry metadata on rate limit", async () => {
    mocks.exportMovementsCsv.mockRejectedValue(new MovementExportRateLimitedError(9));

    const res = await POST(
      new Request("http://localhost/api/movements/export", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orgId: "org_1", mode: "filtered", filters: {} }),
      }),
    );

    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBe("9");
    await expect(res.json()).resolves.toEqual({
      error: {
        code: "RATE_LIMITED",
        message: "Too many export requests. Please try again shortly.",
        retryAfterSeconds: 9,
      },
    });
  });
});
