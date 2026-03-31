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

async function cleanupTestData() {
  console.log("🔍 Scanning for test data...\n");

  // Find all test organizations and users
  const testOrgs = await prisma.organization.findMany({
    where: {
      OR: [
        { slug: { startsWith: "mock-org-" } },
        { name: { contains: "Mock" } },
        { name: { contains: "Test" } },
        { name: { contains: "Verify" } },
        { slug: null }, // Orgs without slugs (likely test data)
      ],
    },
    include: {
      memberships: {
        include: {
          user: true,
        },
      },
    },
  });

  const testUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: "@bodega.local" } },
        { email: { contains: "@example.com" } },
        { email: { contains: "mock.user." } },
        { email: { contains: "test-" } },
        { email: { contains: "verify-" } },
        { email: { contains: "movement-verify" } },
      ],
    },
    include: {
      memberships: true,
    },
  });

  if (testOrgs.length === 0 && testUsers.length === 0) {
    console.log("✅ No test data found to clean up");
    return;
  }

  console.log(`Found:`);
  console.log(`  - ${testOrgs.length} test organization(s)`);
  console.log(`  - ${testUsers.length} test user(s)`);
  console.log("");

  // Delete test organizations
  for (const org of testOrgs) {
    console.log(`🗑️  Deleting org: ${org.name} (${org.slug || "no slug"})`);

    await prisma.$transaction(async (tx) => {
      const currentStockCount = await tx.currentStock.deleteMany({
        where: { orgId: org.id },
      });
      console.log(`    - Deleted ${currentStockCount.count} CurrentStock records`);

      const movementCount = await tx.movement.deleteMany({
        where: { orgId: org.id },
      });
      console.log(`    - Deleted ${movementCount.count} Movement records`);

      const itemCount = await tx.item.deleteMany({
        where: { orgId: org.id },
      });
      console.log(`    - Deleted ${itemCount.count} Item records`);

      const locationCount = await tx.location.deleteMany({
        where: { orgId: org.id },
      });
      console.log(`    - Deleted ${locationCount.count} Location records`);

      const membershipCount = await tx.membership.deleteMany({
        where: { orgId: org.id },
      });
      console.log(`    - Deleted ${membershipCount.count} Membership records`);

      await tx.organization.delete({
        where: { id: org.id },
      });
      console.log(`    ✅ Deleted Organization\n`);
    });
  }

  // Delete orphaned test users (those without any memberships left)
  for (const user of testUsers) {
    // Re-fetch to check current membership count
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        memberships: true,
      },
    });

    if (currentUser && currentUser.memberships.length === 0) {
      // Delete related sessions and accounts first
      await prisma.session.deleteMany({
        where: { userId: user.id },
      });

      await prisma.account.deleteMany({
        where: { userId: user.id },
      });

      await prisma.user.delete({
        where: { id: user.id },
      });
      console.log(`🗑️  Deleted User: ${user.email}`);
    } else if (currentUser) {
      console.log(`⚠️  Skipped User: ${user.email} (still has ${currentUser.memberships.length} membership(s))`);
    }
  }

  console.log("\n✅ Test data cleanup complete");
}

cleanupTestData()
  .catch((error) => {
    console.error("❌ Failed to cleanup test data:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
