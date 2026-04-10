const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const email = "supremenova10@gmail.com";
  const password = "password123";
  const normalizedEmail = email.toLowerCase().trim();
  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findFirst({
    where: { email: { equals: normalizedEmail } },
    select: { id: true },
  });

  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          systemRole: "SYSTEM_ADMIN",
        },
        select: { id: true, email: true, systemRole: true },
      })
    : await prisma.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          systemRole: "SYSTEM_ADMIN",
        },
        select: { id: true, email: true, systemRole: true },
      });

  console.log(
    JSON.stringify(
      {
        action: existing ? "updated" : "created",
        user,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
