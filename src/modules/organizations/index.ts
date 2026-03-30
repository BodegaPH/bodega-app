/**
 * Organizations Module - Public exports
 */
export {
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationName,
  validateMembershipForSwitch,
  getMembers,
  addMember,
  removeMember,
  updateMemberRole,
  OrganizationsApiError,
} from "./service";

export type {
  OrganizationMember,
  OrganizationDataCounts,
  UpdateOrganizationPayload,
  AddMemberPayload,
  DeleteOrganizationOptions,
  DeleteOrganizationResult,
} from "./types";
