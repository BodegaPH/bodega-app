/**
 * Items Repository - Prisma data access layer
 * INTERNAL: Only import from service.ts within this module
 */
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

type ItemRecord = {
  id: string;
  name: string;
  sku: string;
  unit: string;
  category: string | null;
  isActive: boolean;
  lowStockThreshold: Prisma.Decimal | null;
  createdAt: Date;
  updatedAt: Date;
};

const itemSelect = {
  id: true,
  name: true,
  sku: true,
  unit: true,
  category: true,
  isActive: true,
  lowStockThreshold: true,
  createdAt: true,
  updatedAt: true,
} as const;

export function isUniqueError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export async function findItemById(orgId: string, id: string) {
  return prisma.item.findFirst({
    where: { id, orgId },
    select: { id: true },
  });
}

export async function findItemForValidation(orgId: string, itemId: string) {
  return prisma.item.findFirst({
    where: { id: itemId, orgId },
    select: { id: true, name: true, sku: true, unit: true, isActive: true },
  });
}

export async function listItems(orgId: string, includeInactive: boolean): Promise<ItemRecord[]> {
  return prisma.item.findMany({
    where: {
      orgId,
      ...(includeInactive ? {} : { isActive: true }),
    },
    select: itemSelect,
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });
}

export async function listItemsForSelect(orgId: string) {
  return prisma.item.findMany({
    where: { orgId, isActive: true },
    select: { id: true, name: true, sku: true, unit: true },
    orderBy: { name: "asc" },
  });
}

export async function createItem(
  orgId: string,
  data: {
    name: string;
    sku: string;
    unit: string;
    category: string | null;
    lowStockThreshold: string | null;
  }
): Promise<ItemRecord> {
  return prisma.item.create({
    data: { orgId, ...data },
    select: itemSelect,
  });
}

export async function updateItem(
  id: string,
  data: {
    name?: string;
    unit?: string;
    category?: string | null;
    lowStockThreshold?: string | null;
  }
): Promise<ItemRecord> {
  return prisma.item.update({
    where: { id },
    data,
    select: itemSelect,
  });
}

export async function softDeleteItem(id: string) {
  return prisma.item.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function reactivateItem(id: string) {
  return prisma.item.update({
    where: { id },
    data: { isActive: true },
  });
}

export async function countItems(orgId: string): Promise<number> {
  return prisma.item.count({ where: { orgId } });
}
