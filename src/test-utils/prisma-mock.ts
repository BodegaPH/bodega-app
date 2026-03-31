import { vi } from "vitest";

type PrismaMockOverrides = Record<string, unknown>;

export function createPrismaMock(overrides: PrismaMockOverrides = {}) {
  return {
    currentStock: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    movement: {
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
    item: {
      findUnique: vi.fn(),
    },
    membership: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    ...overrides,
  };
}
