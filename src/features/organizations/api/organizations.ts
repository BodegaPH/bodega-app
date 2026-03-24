import { MembershipRole, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type {
  AddMemberPayload,
  DeleteOrganizationOptions,
  DeleteOrganizationResult,
  OrganizationDataCounts,
  OrganizationMember,
  UpdateOrganizationPayload,
} from "@/features/organizations/types";

export class OrganizationsApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly responseBody: Record<string, unknown>
  ) {
    super(typeof responseBody.error === "string" ? responseBody.error : "Organizations API error");
    this.name = "OrganizationsApiError";
  }
}

function requireOrgId(orgId: string): string {
  const trimmed = orgId?.trim();
  if (!trimmed) {
    throw new OrganizationsApiError(400, { error: "Organization ID is required" });
  }

  return trimmed;
}

function validateOrganizationName(name: unknown): string {
  if (typeof name !== "string") {
    throw new OrganizationsApiError(400, { error: "Organization name is required" });
  }

  const trimmed = name.trim();
  if (!trimmed) {
    throw new OrganizationsApiError(400, { error: "Organization name is required" });
  }

  if (trimmed.length < 2) {
    throw new OrganizationsApiError(400, {
      error: "Organization name must be at least 2 characters",
    });
  }

  if (trimmed.length > 100) {
    throw new OrganizationsApiError(400, {
      error: "Organization name must be 100 characters or less",
    });
  }

  return trimmed;
}

function normalizeMemberEmail(email: unknown): string {
  if (typeof email !== "string") {
    throw new OrganizationsApiError(400, { error: "Email is required" });
  }

  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    throw new OrganizationsApiError(400, { error: "Email is required" });
  }

  return normalized;
}

function mapMembershipToMember(
  membership: {
    role: MembershipRole;
    user: {
      id: string;
      name: string | null;
      email: string | null;
    };
  }
): OrganizationMember {
  return {
    id: membership.user.id,
    name: membership.user.name,
    email: membership.user.email,
    role: membership.role,
  };
}

export async function updateOrganization(orgId: string, payload: UpdateOrganizationPayload) {
  const validatedOrgId = requireOrgId(orgId);
  const validatedName = validateOrganizationName(payload?.name);

  try {
    return await prisma.organization.update({
      where: { id: validatedOrgId },
      data: { name: validatedName },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new OrganizationsApiError(404, { error: "Not found" });
    }

    throw error;
  }
}

async function getOrganizationDataCounts(orgId: string): Promise<OrganizationDataCounts> {
  const [itemCount, locationCount, movementCount, stockCount] = await Promise.all([
    prisma.item.count({ where: { orgId } }),
    prisma.location.count({ where: { orgId } }),
    prisma.movement.count({ where: { orgId } }),
    prisma.currentStock.count({ where: { orgId } }),
  ]);

  return {
    items: itemCount,
    locations: locationCount,
    movements: movementCount,
    stock: stockCount,
  };
}

export async function deleteOrganization(
  orgId: string,
  options?: DeleteOrganizationOptions
): Promise<DeleteOrganizationResult> {
  const validatedOrgId = requireOrgId(orgId);

  if (!options?.requesterUserId) {
    throw new OrganizationsApiError(400, { error: "Requester user ID is required" });
  }

  const userMemberships = await prisma.membership.findMany({
    where: { userId: options.requesterUserId },
    select: { orgId: true },
  });

  if (userMemberships.length <= 1) {
    throw new OrganizationsApiError(400, { error: "Cannot delete your last organization" });
  }

  const nextOrgId = userMemberships.find((membership) => membership.orgId !== validatedOrgId)?.orgId;
  if (!nextOrgId) {
    throw new OrganizationsApiError(400, { error: "No valid organization to switch to" });
  }

  const details = await getOrganizationDataCounts(validatedOrgId);
  const hasData = details.items > 0 || details.locations > 0 || details.movements > 0 || details.stock > 0;

  if (hasData && !options.force) {
    return {
      deleted: false,
      requiresConfirmation: true,
      details,
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.currentStock.deleteMany({ where: { orgId: validatedOrgId } });
    await tx.movement.deleteMany({ where: { orgId: validatedOrgId } });
    await tx.item.deleteMany({ where: { orgId: validatedOrgId } });
    await tx.location.deleteMany({ where: { orgId: validatedOrgId } });
    await tx.membership.deleteMany({ where: { orgId: validatedOrgId } });
    await tx.organization.delete({ where: { id: validatedOrgId } });
  });

  return {
    deleted: true,
    nextOrgId,
  };
}

export async function getMembers(orgId: string): Promise<OrganizationMember[]> {
  const validatedOrgId = requireOrgId(orgId);

  const members = await prisma.membership.findMany({
    where: {
      orgId: validatedOrgId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      role: "desc",
    },
  });

  return members.map(mapMembershipToMember);
}

export async function addMember(orgId: string, payload: AddMemberPayload): Promise<OrganizationMember> {
  const validatedOrgId = requireOrgId(orgId);
  const email = normalizeMemberEmail(payload?.email);
  const role = payload?.role ?? "ORG_USER";

  if (role !== "ORG_ADMIN" && role !== "ORG_USER") {
    throw new OrganizationsApiError(400, { error: "Invalid membership role" });
  }

  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    throw new OrganizationsApiError(404, { error: "User not found" });
  }

  const existingMembership = await prisma.membership.findUnique({
    where: {
      userId_orgId: {
        userId: user.id,
        orgId: validatedOrgId,
      },
    },
  });

  if (existingMembership) {
    throw new OrganizationsApiError(409, { error: "User is already a member of this organization" });
  }

  const createdMembership = await prisma.membership.create({
    data: {
      orgId: validatedOrgId,
      userId: user.id,
      role,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return mapMembershipToMember(createdMembership);
}

export async function removeMember(orgId: string, userId: string): Promise<void> {
  const validatedOrgId = requireOrgId(orgId);
  const validatedUserId = userId?.trim();

  if (!validatedUserId) {
    throw new OrganizationsApiError(400, { error: "User ID is required" });
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId_orgId: {
        userId: validatedUserId,
        orgId: validatedOrgId,
      },
    },
  });

  if (!membership) {
    throw new OrganizationsApiError(404, { error: "Member not found" });
  }

  if (membership.role === "ORG_ADMIN") {
    const adminCount = await prisma.membership.count({
      where: {
        orgId: validatedOrgId,
        role: "ORG_ADMIN",
      },
    });

    if (adminCount <= 1) {
      throw new OrganizationsApiError(400, {
        error: "Cannot remove the last organization admin",
      });
    }
  }

  await prisma.membership.delete({
    where: {
      userId_orgId: {
        userId: validatedUserId,
        orgId: validatedOrgId,
      },
    },
  });
}

export async function updateMemberRole(
  orgId: string,
  userId: string,
  role: MembershipRole
): Promise<OrganizationMember> {
  const validatedOrgId = requireOrgId(orgId);
  const validatedUserId = userId?.trim();

  if (!validatedUserId) {
    throw new OrganizationsApiError(400, { error: "User ID is required" });
  }

  if (role !== "ORG_ADMIN" && role !== "ORG_USER") {
    throw new OrganizationsApiError(400, { error: "Invalid membership role" });
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId_orgId: {
        userId: validatedUserId,
        orgId: validatedOrgId,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!membership) {
    throw new OrganizationsApiError(404, { error: "Member not found" });
  }

  if (membership.role === "ORG_ADMIN" && role === "ORG_USER") {
    const adminCount = await prisma.membership.count({
      where: {
        orgId: validatedOrgId,
        role: "ORG_ADMIN",
      },
    });

    if (adminCount <= 1) {
      throw new OrganizationsApiError(400, {
        error: "Organization must have at least one admin",
      });
    }
  }

  const updatedMembership = await prisma.membership.update({
    where: {
      userId_orgId: {
        userId: validatedUserId,
        orgId: validatedOrgId,
      },
    },
    data: {
      role,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return mapMembershipToMember(updatedMembership);
}
