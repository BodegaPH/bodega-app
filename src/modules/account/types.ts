export type UserProfile = {
  id: string;
  name: string | null;
  email: string | null;
  hasPassword: boolean;
};

export type UpdateProfileInput = {
  name: string;
  email: string;
  currentPassword?: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};
