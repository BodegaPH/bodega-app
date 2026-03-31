import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function applyMovement({ orgId, userId, itemId, locationId, type, quantity, createdAt, reason }) {
  await prisma.$transaction(async (tx) => {
    const existingStock = await tx.currentStock.findUnique({
      where: {
        orgId_itemId_locationId: {
          orgId,
          itemId,
          locationId,
        },
      },
    });

    const currentQty = existingStock ? Number(existingStock.quantity) : 0;

    let nextQty = currentQty;
    if (type === "RECEIVE") {
      nextQty += quantity;
    } else if (type === "ISSUE") {
      nextQty -= quantity;
      if (nextQty < 0) {
        throw new Error(`ISSUE would create negative stock for item ${itemId} at location ${locationId}`);
      }
    } else if (type === "ADJUSTMENT") {
      nextQty += quantity;
    }

    await tx.movement.create({
      data: {
        orgId,
        itemId,
        locationId,
        createdById: userId,
        type,
        quantity,
        reason,
        createdAt,
      },
    });

    if (existingStock) {
      await tx.currentStock.update({
        where: { id: existingStock.id },
        data: { quantity: nextQty },
      });
    } else {
      await tx.currentStock.create({
        data: {
          orgId,
          itemId,
          locationId,
          quantity: nextQty,
        },
      });
    }
  });
}

async function main() {
  // Security: Prevent accidental production seeding
  if (!process.env.ALLOW_MOCK_SEED) {
    console.error("❌ Set ALLOW_MOCK_SEED=true to run this script");
    console.error("   This prevents accidental seeding on production databases.");
    process.exit(1);
  }

  const suffix = Date.now().toString().slice(-6);
  const plainPassword = "MockData123!";

  const user = await prisma.user.create({
    data: {
      name: `Mock User ${suffix}`,
      email: `mock.user.${suffix}@bodega.local`,
      password: await bcrypt.hash(plainPassword, 10),
      systemRole: "USER",
    },
  });

  const org = await prisma.organization.create({
    data: {
      name: `Mock Org ${suffix}`,
      slug: `mock-org-${suffix}`,
      isActive: true,
    },
  });

  await prisma.membership.create({
    data: {
      userId: user.id,
      orgId: org.id,
      role: "ORG_ADMIN",
    },
  });

  const mainWarehouse = await prisma.location.create({
    data: {
      orgId: org.id,
      name: "Main Warehouse",
      isDefault: true,
    },
  });

  const storefront = await prisma.location.create({
    data: {
      orgId: org.id,
      name: "Storefront",
      isDefault: false,
    },
  });

  const milk = await prisma.item.create({
    data: {
      orgId: org.id,
      sku: `MLK-${suffix}`,
      name: "Whole Milk 1L",
      unit: "pcs",
      category: "Dairy",
      lowStockThreshold: 20,
    },
  });

  const rice = await prisma.item.create({
    data: {
      orgId: org.id,
      sku: `RCE-${suffix}`,
      name: "Rice 5kg",
      unit: "bags",
      category: "Grains",
      lowStockThreshold: 30,
    },
  });

  const soda = await prisma.item.create({
    data: {
      orgId: org.id,
      sku: `SDA-${suffix}`,
      name: "Soda Can",
      unit: "pcs",
      category: "Beverages",
      lowStockThreshold: 25,
    },
  });

  const sugar = await prisma.item.create({
    data: {
      orgId: org.id,
      sku: `SGR-${suffix}`,
      name: "White Sugar 1kg",
      unit: "packs",
      category: "Pantry",
      lowStockThreshold: 15,
    },
  });

  // Low stock scenario (qty 15 <= threshold 20)
  await applyMovement({
    orgId: org.id,
    userId: user.id,
    itemId: milk.id,
    locationId: mainWarehouse.id,
    type: "RECEIVE",
    quantity: 100,
    createdAt: daysAgo(12),
  });
  await applyMovement({
    orgId: org.id,
    userId: user.id,
    itemId: milk.id,
    locationId: mainWarehouse.id,
    type: "ISSUE",
    quantity: 85,
    createdAt: daysAgo(2),
  });

  // Large outbound scenario (issued 60 out of stock-at-time 100 = 60%)
  await applyMovement({
    orgId: org.id,
    userId: user.id,
    itemId: rice.id,
    locationId: mainWarehouse.id,
    type: "RECEIVE",
    quantity: 100,
    createdAt: daysAgo(6),
  });
  await applyMovement({
    orgId: org.id,
    userId: user.id,
    itemId: rice.id,
    locationId: mainWarehouse.id,
    type: "ISSUE",
    quantity: 60,
    createdAt: daysAgo(1),
  });

  // Frequent adjustments scenario (>3 adjustments in 7 days)
  await applyMovement({
    orgId: org.id,
    userId: user.id,
    itemId: soda.id,
    locationId: storefront.id,
    type: "RECEIVE",
    quantity: 80,
    createdAt: daysAgo(10),
  });
  await applyMovement({
    orgId: org.id,
    userId: user.id,
    itemId: soda.id,
    locationId: storefront.id,
    type: "ADJUSTMENT",
    quantity: 1,
    reason: "Cycle count correction",
    createdAt: daysAgo(6),
  });
  await applyMovement({
    orgId: org.id,
    userId: user.id,
    itemId: soda.id,
    locationId: storefront.id,
    type: "ADJUSTMENT",
    quantity: 1,
    reason: "Damaged can replacement",
    createdAt: daysAgo(4),
  });
  await applyMovement({
    orgId: org.id,
    userId: user.id,
    itemId: soda.id,
    locationId: storefront.id,
    type: "ADJUSTMENT",
    quantity: 1,
    reason: "Receiving recount",
    createdAt: daysAgo(3),
  });
  await applyMovement({
    orgId: org.id,
    userId: user.id,
    itemId: soda.id,
    locationId: storefront.id,
    type: "ADJUSTMENT",
    quantity: 1,
    reason: "POS sync reconciliation",
    createdAt: daysAgo(1),
  });

  // Normal inventory records for export testing
  await applyMovement({
    orgId: org.id,
    userId: user.id,
    itemId: sugar.id,
    locationId: mainWarehouse.id,
    type: "RECEIVE",
    quantity: 50,
    createdAt: daysAgo(8),
  });
  await applyMovement({
    orgId: org.id,
    userId: user.id,
    itemId: sugar.id,
    locationId: mainWarehouse.id,
    type: "ISSUE",
    quantity: 10,
    createdAt: daysAgo(2),
  });

  console.log("✅ Mock data inserted into Neon database");
  console.log("📧 Email:", user.email);
  console.log("🔑 Password: [REDACTED - check script source for test password]");
  console.log("🏢 Organization:", org.name);
  console.log("🆔 Org ID:", org.id);
  console.log("🔗 Org Slug:", org.slug);
  console.log("\nℹ️  Notes:");
  console.log("  - Includes Low Stock indicator data");
  console.log("  - Includes Large Outbound indicator data");
  console.log("  - Includes Frequent Adjustments indicator data");
  console.log("  - Includes rows for CSV export testing");
}

main()
  .catch((error) => {
    console.error("❌ Failed to seed mock data:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
