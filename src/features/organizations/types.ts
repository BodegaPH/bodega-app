import { MembershipRole } from "@prisma/client";

export type OrganizationRole = MembershipRole;

export interface UpdateOrganizationPayload {
  name: string;
}

export interface OrganizationDataCounts {
  items: number;
  locations: number;
  movements: number;
  stock: number;
}

export interface DeleteOrganizationOptions {
  requesterUserId: string;
  force?: boolean;
}

export type DeleteOrganizationResult =
  | {
      deleted: true;
      nextOrgId: string;
    }
  | {
      deleted: false;
      requiresConfirmation: true;
      details: OrganizationDataCounts;
    };

export interface OrganizationMember {
  id: string;
  name: string | null;
  email: string | null;
  role: MembershipRole;
}

export interface AddMemberPayload {
  email: string;
  role?: MembershipRole;
}
