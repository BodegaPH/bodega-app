import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listMovementsForExport: vi.fn(),
  validateItem: vi.fn(),
  validateLocation: vi.fn(),
  checkMovementExportRateLimit: vi.fn(),
}));

vi.mock("../repository", async () => {
  const actual = await vi.importActual<typeof import("../repository")>("../repository");
  return {
    ...actual,
    listMovementsForExport: mocks.listMovementsForExport,
  };
});

vi.mock("@/modules/items", () => ({
  validateForMovement: mocks.validateItem,
}));

vi.mock("@/modules/locations", () => ({
  validateForMovement: mocks.validateLocation,
}));

vi.mock("../export-rate-limiter", () => ({
  checkMovementExportRateLimit: mocks.checkMovementExportRateLimit,
}));

vi.mock("../constants", async () => {
  const actual = await vi.importActual<typeof import("../constants")>("../constants");
  return {
    ...actual,
    MOVEMENT_EXPORT_SYNC_ROW_CAP: 2,
    MOVEMENT_EXPORT_TIMEOUT_MS: 10,
  };
});

import {
  exportMovementsCsv,
  InvalidMovementExportFiltersError,
  MovementExportCapExceededError,
  MovementExportRateLimitedError,
  MovementExportServerError,
  MovementExportTimeoutError,
} from "../service";

describe("exportMovementsCsv taxonomy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.validateItem.mockResolvedValue({ valid: true });
    mocks.validateLocation.mockResolvedValue({ valid: true });
    mocks.checkMovementExportRateLimit.mockReturnValue({ allowed: true, retryAfterSeconds: 0 });
    mocks.listMovementsForExport.mockResolvedValue([
      {
        id: "mov_1",
        type: "RECEIVE",
        quantity: { toString: () => "1" },
        reason: null,
        createdAt: new Date("2026-04-01T10:30:00.000Z"),
        item: { id: "i1", name: "Item", sku: "SKU", unit: "pcs" },
        location: { id: "l1", name: "Main" },
        createdBy: { id: "u1", name: "User", email: "u@example.com" },
      },
    ]);
  });

  it("maps invalid filters", async () => {
    await expect(
      exportMovementsCsv("org_1", "user_1", {
        mode: "all",
        confirmedAll: false,
      }),
    ).rejects.toBeInstanceOf(InvalidMovementExportFiltersError);
  });

  it("maps cap exceeded", async () => {
    mocks.listMovementsForExport.mockResolvedValue([
      {
        id: "mov_1",
        type: "RECEIVE",
        quantity: { toString: () => "1" },
        reason: null,
        createdAt: new Date("2026-04-01T10:30:00.000Z"),
        item: { id: "i1", name: "Item", sku: "SKU", unit: "pcs" },
        location: { id: "l1", name: "Main" },
        createdBy: { id: "u1", name: "User", email: "u@example.com" },
      },
      {
        id: "mov_2",
        type: "RECEIVE",
        quantity: { toString: () => "1" },
        reason: null,
        createdAt: new Date("2026-04-01T10:31:00.000Z"),
        item: { id: "i1", name: "Item", sku: "SKU", unit: "pcs" },
        location: { id: "l1", name: "Main" },
        createdBy: { id: "u1", name: "User", email: "u@example.com" },
      },
      {
        id: "mov_3",
        type: "RECEIVE",
        quantity: { toString: () => "1" },
        reason: null,
        createdAt: new Date("2026-04-01T10:32:00.000Z"),
        item: { id: "i1", name: "Item", sku: "SKU", unit: "pcs" },
        location: { id: "l1", name: "Main" },
        createdBy: { id: "u1", name: "User", email: "u@example.com" },
      },
    ]);

    await expect(
      exportMovementsCsv("org_1", "user_1", { mode: "filtered", filters: {} }),
    ).rejects.toBeInstanceOf(MovementExportCapExceededError);
  });

  it("maps timeout", async () => {
    mocks.listMovementsForExport.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(1), 30)),
    );

    await expect(
      exportMovementsCsv("org_1", "user_1", { mode: "filtered", filters: {} }),
    ).rejects.toBeInstanceOf(MovementExportTimeoutError);
  });

  it("maps rate limited", async () => {
    mocks.checkMovementExportRateLimit.mockReturnValue({ allowed: false, retryAfterSeconds: 12 });

    await expect(
      exportMovementsCsv("org_1", "user_1", { mode: "filtered", filters: {} }),
    ).rejects.toBeInstanceOf(MovementExportRateLimitedError);
  });

  it("maps unknown failure to server error", async () => {
    mocks.listMovementsForExport.mockRejectedValue(new Error("boom"));

    await expect(
      exportMovementsCsv("org_1", "user_1", { mode: "filtered", filters: {} }),
    ).rejects.toBeInstanceOf(MovementExportServerError);
  });
});
