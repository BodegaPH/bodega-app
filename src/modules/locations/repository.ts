/**
 * Locations Repository - Prisma data access layer
 * INTERNAL: Only import from service.ts within this module
 */
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { LocationDTO } from "./types";

const locationSelect = {
  id: true,
  name: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
} as const;

export function isUniqueError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export async function findLocationById(orgId: string, id: string) {
  return prisma.location.findFirst({
    where: { id, orgId },
    select: { id: true, name: true, isDefault: true },
  });
}

export async function findLocationForValidation(orgId: string, locationId: string) {
  return prisma.location.findFirst({
    where: { id: locationId, orgId },
    select: { id: true, name: true },
  });
}

export async function findByName(orgId: string, name: string, excludeId?: string) {
  return prisma.location.findFirst({
    where: {
      orgId,
      ...(excludeId ? { id: { not: excludeId } } : {}),
      name: { equals: name, mode: "insensitive" },
    },
    select: { id: true },
  });
}

export async function listLocations(orgId: string): Promise<LocationDTO[]> {
  return prisma.location.findMany({
    where: { orgId },
    select: locationSelect,
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });
}

export async function listLocationsForSelect(orgId: string) {
  return prisma.location.findMany({
    where: { orgId },
    select: { id: true, name: true, isDefault: true },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });
}

export async function findCurrentDefault(orgId: string) {
  return prisma.location.findFirst({
    where: { orgId, isDefault: true },
    select: { id: true },
  });
}

export async function createLocationWithDefault(
  orgId: string,
  name: string,
  makeDefault: boolean
): Promise<LocationDTO> {
  return prisma.$transaction(async (tx) => {
    if (makeDefault) {
      await tx.location.updateMany({
        where: { orgId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return tx.location.create({
      data: { orgId, name, isDefault: makeDefault },
      select: locationSelect,
    });
  });
}

export async function updateLocationWithDefault(
  orgId: string,
  id: string,
  name: string | undefined,
  makeDefault: boolean
): Promise<LocationDTO> {
  return prisma.$transaction(async (tx) => {
    if (makeDefault) {
      await tx.location.updateMany({
        where: { orgId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return tx.location.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(makeDefault ? { isDefault: true } : {}),
      },
      select: locationSelect,
    });
  });
}

export async function countStockAtLocation(orgId: string, locationId: string): Promise<number> {
  return prisma.currentStock.count({
    where: { orgId, locationId },
  });
}

export async function deleteLocation(id: string): Promise<void> {
  await prisma.location.delete({ where: { id } });
}

export async function countLocations(orgId: string): Promise<number> {
  return prisma.location.count({ where: { orgId } });
}
