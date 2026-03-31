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

async function cleanupMockData() {
  // Find all mock organizations (created by seed script)
  const mockOrgs = await prisma.organization.findMany({
    where: {
      slug: {
        startsWith: "mock-org-",
      },
    },
    include: {
      memberships: {
        include: {
          user: true,
        },
      },
    },
  });

  if (mockOrgs.length === 0) {
    console.log("✅ No mock data found to clean up");
    return;
  }

  console.log(`🧹 Found ${mockOrgs.length} mock organization(s) to delete`);

  for (const org of mockOrgs) {
    console.log(`\n  Deleting org: ${org.name} (${org.slug})`);

    // Collect user IDs for cleanup after org deletion
    const userIds = org.memberships.map((m) => m.userId);

    await prisma.$transaction(async (tx) => {
      // Delete in dependency order (respecting onDelete: Restrict)
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

      // Memberships will cascade when org is deleted, but delete explicitly for clarity
      const membershipCount = await tx.membership.deleteMany({
        where: { orgId: org.id },
      });
      console.log(`    - Deleted ${membershipCount.count} Membership records`);

      await tx.organization.delete({
        where: { id: org.id },
      });
      console.log(`    - Deleted Organization: ${org.name}`);
    });

    // Delete mock users (email pattern: mock.user.XXXXXX@bodega.local)
    for (const userId of userIds) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          memberships: true,
        },
      });

      // Only delete if this was a mock user and has no other org memberships
      if (
        user &&
        user.email?.includes("@bodega.local") &&
        user.email?.startsWith("mock.user.") &&
        user.memberships.length === 0
      ) {
        await prisma.user.delete({
          where: { id: userId },
        });
        console.log(`    - Deleted User: ${user.email}`);
      }
    }
  }

  console.log("\n✅ Mock data cleanup complete");
}

cleanupMockData()
  .catch((error) => {
    console.error("❌ Failed to cleanup mock data:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
