/**
 * Account Service - Public API for the account module
 */
import bcrypt from "bcrypt";
import * as repo from "./repository";
import { AccountApiError } from "./errors";
import type { UserProfile, UpdateProfileInput, ChangePasswordInput } from "./types";

export { AccountApiError } from "./errors";
export type { UserProfile, UpdateProfileInput, ChangePasswordInput } from "./types";

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const user = await repo.findUserById(userId);

  if (!user) {
    throw new AccountApiError("User not found", 404);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    hasPassword: !!user.password,
  };
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
  currentEmail?: string | null
): Promise<{ id: string; name: string | null; email: string | null }> {
  // Validate name
  if (!input.name || typeof input.name !== "string" || input.name.trim().length === 0) {
    throw new AccountApiError("Name is required", 400);
  }

  // Validate email format
  if (!input.email || typeof input.email !== "string") {
    throw new AccountApiError("Invalid email format", 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(input.email)) {
    throw new AccountApiError("Invalid email format", 400);
  }

  const trimmedName = input.name.trim();
  const trimmedEmail = input.email.toLowerCase().trim();
  const isEmailChanged = trimmedEmail !== currentEmail?.toLowerCase();

  if (isEmailChanged) {
    if (!input.currentPassword) {
      throw new AccountApiError("Current password is required to change email", 400);
    }

    const user = await repo.findUserById(userId);
    if (!user?.password) {
      throw new AccountApiError("Cannot change email for OAuth accounts", 400);
    }

    const passwordValid = await bcrypt.compare(input.currentPassword, user.password);
    if (!passwordValid) {
      throw new AccountApiError("Current password is incorrect", 401);
    }

    // Check email uniqueness
    const existingUser = await repo.findUserByEmail(trimmedEmail);
    if (existingUser && existingUser.id !== userId) {
      throw new AccountApiError("Email already in use", 409);
    }
  }

  return repo.updateUser(userId, { name: trimmedName, email: trimmedEmail });
}

export async function changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
  if (!input.currentPassword || !input.newPassword) {
    throw new AccountApiError("Current password and new password are required", 400);
  }

  if (input.newPassword.length < 12) {
    throw new AccountApiError("Password must be at least 12 characters", 400);
  }

  if (input.newPassword.length > 72) {
    throw new AccountApiError("Password must not exceed 72 characters", 400);
  }

  const user = await repo.findUserById(userId);
  if (!user) {
    throw new AccountApiError("User not found", 404);
  }

  if (!user.password) {
    throw new AccountApiError("Password change not available for OAuth accounts", 400);
  }

  const isPasswordValid = await bcrypt.compare(input.currentPassword, user.password);
  if (!isPasswordValid) {
    throw new AccountApiError("Current password is incorrect", 401);
  }

  const hashedPassword = await bcrypt.hash(input.newPassword, 10);
  await repo.updateUser(userId, { password: hashedPassword });
}
