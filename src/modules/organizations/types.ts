export type MembershipRole = "ORG_ADMIN" | "ORG_USER";

export type OrganizationMember = {
  id: string;
  name: string | null;
  email: string | null;
  role: MembershipRole;
};

export type OrganizationDataCounts = {
  items: number;
  locations: number;
  movements: number;
  stock: number;
};

export type UpdateOrganizationPayload = {
  name: string;
};

export type AddMemberPayload = {
  email: string;
  role?: MembershipRole;
};

export type DeleteOrganizationOptions = {
  requesterUserId: string;
  force?: boolean;
};

export type DeleteOrganizationResult =
  | { deleted: true; nextOrgId: string }
  | { deleted: false; requiresConfirmation: true; details: OrganizationDataCounts };
