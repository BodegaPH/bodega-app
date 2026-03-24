// Server-only exports - DO NOT import in Client Components
export {
  AccountApiError,
  changePassword,
  getUserProfile,
  updateProfile,
} from "./api/account";
export type { UserProfile } from "./api/account";
