/**
 * Account Repository - Prisma data access layer
 * INTERNAL: Only import from service.ts within this module
 */
import { prisma } from "@/lib/db";

export async function findUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
    },
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function updateUser(
  userId: string,
  data: { name?: string; email?: string; password?: string }
) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
}
