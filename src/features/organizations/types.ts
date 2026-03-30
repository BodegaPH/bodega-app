// Re-export types from module for client components
// Import directly from types.ts to avoid pulling in Prisma
import type { MembershipRole } from "@/modules/organizations/types";

export type { MembershipRole };
export type OrganizationRole = MembershipRole;

export type {
  OrganizationMember,
  OrganizationDataCounts,
  UpdateOrganizationPayload,
  AddMemberPayload,
  DeleteOrganizationOptions,
  DeleteOrganizationResult,
} from "@/modules/organizations/types";
