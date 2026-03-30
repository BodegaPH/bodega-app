"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createOrganization, validateMembershipForSwitch } from "@/modules/organizations";

type CreateOrgResult =
  | { success: true; orgId: string }
  | { success: false; error: string };

type SwitchOrgResult =
  | { success: true; orgId: string }
  | { success: false; error: string };

/**
 * Server action to create a new organization.
 * Delegates to organizations module for business logic.
 */
export async function createOrg(formData: FormData): Promise<CreateOrgResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const name = formData.get("name")?.toString()?.trim();
  if (!name) {
    return { success: false, error: "Organization name is required" };
  }

  try {
    const org = await createOrganization({ name, userId: session.user.id });
    return { success: true, orgId: org.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create organization";
    return { success: false, error: message };
  }
}

/**
 * Server action to switch active organization.
 * Delegates to organizations module for validation.
 */
export async function switchOrg(orgId: string): Promise<SwitchOrgResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (!orgId) {
    return { success: false, error: "Organization ID is required" };
  }

  try {
    const validation = await validateMembershipForSwitch({ userId: session.user.id, orgId });
    
    if (!validation.valid) {
      return { success: false, error: validation.reason };
    }

    // Revalidate to refresh data with new org context
    revalidatePath("/");

    return { success: true, orgId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to switch organization";
    return { success: false, error: message };
  }
}
