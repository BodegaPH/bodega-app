import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MovementType } from "../types";
import type { CreateMovementInput } from "../types";

const canRunIntegrationTests = Boolean(process.env.DATABASE_URL);

if (!canRunIntegrationTests) {
  describe.skip("Concurrent Stock Integrity", () => {
    it("skips when DATABASE_URL is not set", () => {});
  });
} else {
  const { prisma } = await import("@/lib/db");
  const { createMovement } = await import("../service");

  describe("Concurrent Stock Integrity", () => {
    const testOrgId = `test-org-${Date.now()}`;
    const testUserId = `test-user-${Date.now()}`;
    const testItemId = `test-item-${Date.now()}`;
    const testLocationId = `test-location-${Date.now()}`;

    beforeEach(async () => {
      await prisma.organization.create({
        data: { id: testOrgId, name: "Test Org", slug: `test-org-${Date.now()}` },
      });

      await prisma.user.create({
        data: {
          id: testUserId,
          email: `test-${Date.now()}@example.com`,
          name: "Test User",
        },
      });

      await prisma.item.create({
        data: {
          id: testItemId,
          orgId: testOrgId,
          name: "Test Item",
          sku: `TEST-${Date.now()}`,
          unit: "pcs",
        },
      });

      await prisma.location.create({
        data: {
          id: testLocationId,
          orgId: testOrgId,
          name: "Test Location",
        },
      });

      await prisma.currentStock.create({
        data: {
          orgId: testOrgId,
          itemId: testItemId,
          locationId: testLocationId,
          quantity: 10,
        },
      });
    });

    afterEach(async () => {
      await prisma.currentStock.deleteMany({ where: { orgId: testOrgId } });
      await prisma.movement.deleteMany({ where: { orgId: testOrgId } });
      await prisma.item.deleteMany({ where: { id: testItemId } });
      await prisma.location.deleteMany({ where: { id: testLocationId } });
      await prisma.membership.deleteMany({ where: { orgId: testOrgId } });
      await prisma.user.deleteMany({ where: { id: testUserId } });
      await prisma.organization.deleteMany({ where: { id: testOrgId } });
    });

    it("prevents negative stock under concurrent ISSUE movements", async () => {
      const movements: CreateMovementInput[] = [
        {
          type: MovementType.ISSUE,
          quantity: 8,
          itemId: testItemId,
          locationId: testLocationId,
          createdById: testUserId,
          reason: null,
        },
        {
          type: MovementType.ISSUE,
          quantity: 5,
          itemId: testItemId,
          locationId: testLocationId,
          createdById: testUserId,
          reason: null,
        },
      ];

      const results = await Promise.allSettled(movements.map((m) => createMovement(testOrgId, m)));

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      expect(successful).toBe(1);
      expect(failed).toBe(1);

      const finalStock = await prisma.currentStock.findUnique({
        where: {
          orgId_itemId_locationId: {
            orgId: testOrgId,
            itemId: testItemId,
            locationId: testLocationId,
          },
        },
      });

      expect(Number(finalStock?.quantity)).toBe(2);
    });

    it("handles concurrent RECEIVE movements correctly", async () => {
      const movements: CreateMovementInput[] = Array(5)
        .fill(null)
        .map(() => ({
          type: MovementType.RECEIVE,
          quantity: 3,
          itemId: testItemId,
          locationId: testLocationId,
          createdById: testUserId,
          reason: null,
        }));

      const results = await Promise.allSettled(movements.map((m) => createMovement(testOrgId, m)));

      expect(results.every((r) => r.status === "fulfilled")).toBe(true);

      const finalStock = await prisma.currentStock.findUnique({
        where: {
          orgId_itemId_locationId: {
            orgId: testOrgId,
            itemId: testItemId,
            locationId: testLocationId,
          },
        },
      });

      expect(Number(finalStock?.quantity)).toBe(25);
    });

    it("validates CurrentStock matches Movement ledger sum", async () => {
      await createMovement(testOrgId, {
        type: MovementType.RECEIVE,
        quantity: 20,
        itemId: testItemId,
        locationId: testLocationId,
        createdById: testUserId,
        reason: null,
      });

      await createMovement(testOrgId, {
        type: MovementType.ISSUE,
        quantity: 5,
        itemId: testItemId,
        locationId: testLocationId,
        createdById: testUserId,
        reason: null,
      });

      await createMovement(testOrgId, {
        type: MovementType.ADJUSTMENT,
        quantity: -3,
        reason: "Damaged goods",
        itemId: testItemId,
        locationId: testLocationId,
        createdById: testUserId,
      });

      const finalStock = await prisma.currentStock.findUnique({
        where: {
          orgId_itemId_locationId: {
            orgId: testOrgId,
            itemId: testItemId,
            locationId: testLocationId,
          },
        },
      });

      expect(Number(finalStock?.quantity)).toBe(22);
    });

    it("rejects ADJUSTMENT without reason", async () => {
      await expect(
        createMovement(testOrgId, {
          type: MovementType.ADJUSTMENT,
          quantity: -2,
          itemId: testItemId,
          locationId: testLocationId,
          createdById: testUserId,
          reason: null,
        })
      ).rejects.toThrow();
    });
  });
}
