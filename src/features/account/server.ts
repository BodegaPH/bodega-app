// Server-only exports - DO NOT import in Client Components
// Re-exports from @/modules/account
export {
  AccountApiError,
  changePassword,
  getUserProfile,
  updateProfile,
} from "@/modules/account";

export type {
  UserProfile,
  UpdateProfileInput,
  ChangePasswordInput,
} from "@/modules/account";
