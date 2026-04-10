import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { Session } from "next-auth";
import { prisma } from "@/lib/db";
import type { MembershipRole } from "@/modules/organizations/types";
import { apiError } from "@/lib/api-errors";
import { isPlatformAdminRole } from "@/lib/system-role";
import {
  PLATFORM_ADMIN_STEP_UP_COOKIE,
  SensitivePlatformAdminAction,
  isPrivilegedStepUpRevoked,
  logPlatformSecurityAudit,
  validateStepUpToken,
} from "@/lib/platform-admin-security";

type AuthResult =
  | { success: true; session: Session }
  | { success: false; response: NextResponse };

type AuthWithOrgResult =
  | {
      success: true;
      session: Session;
      orgId: string;
      orgRole: MembershipRole;
    }
  | { success: false; response: NextResponse };

type AuthPlatformAdminResult =
  | {
      success: true;
      session: Session;
    }
  | { success: false; response: NextResponse };

type ElevatedPlatformAdminResult =
  | {
      success: true;
      session: Session;
    }
  | {
      success: false;
      response: NextResponse;
    };

interface AuthWithOrgOptions {
  allowedRoles?: MembershipRole[];
}

/**
 * Validates auth for API routes. Returns discriminated union for type safety.
 *
 * Usage:
 * ```ts
 * const auth = await requireAuth();
 * if (!auth.success) return auth.response;
 * const { session } = auth;
 * ```
 */
export async function requireAuth(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      success: false,
      response: apiError("Unauthorized", 401),
    };
  }

  return { success: true, session };
}

/**
 * Validates auth AND org membership for org-scoped API routes.
 * Returns session, orgId, and user's role in that org.
 *
 * Usage:
 * ```ts
 * const auth = await requireAuthWithOrg();
 * if (!auth.success) return auth.response;
 * const { session, orgId, orgRole } = auth;
 * ```
 *
 * With role-based access control:
 * ```ts
 * const auth = await requireAuthWithOrg({ allowedRoles: ["ORG_ADMIN", "ORG_USER"] });
 * if (!auth.success) return auth.response;
 * ```
 */
export async function requireAuthWithOrg(
  options?: AuthWithOrgOptions
): Promise<AuthWithOrgResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      success: false,
      response: apiError("Unauthorized", 401),
    };
  }

  const activeOrgId = session.user.activeOrgId;
  if (!activeOrgId) {
    return {
      success: false,
      response: apiError("Organization context required", 400),
    };
  }

  // Validate membership still exists
  const membership = await prisma.membership.findUnique({
    where: {
      userId_orgId: {
        userId: session.user.id,
        orgId: activeOrgId,
      },
    },
  });

  if (!membership) {
    return {
      success: false,
      response: apiError("You are not a member of this organization", 403),
    };
  }

  // Check role-based access control if specified
  if (options?.allowedRoles && !options.allowedRoles.includes(membership.role)) {
    return {
      success: false,
      response: apiError("Insufficient permissions", 403),
    };
  }

  return {
    success: true,
    session,
    orgId: activeOrgId,
    orgRole: membership.role,
  };
}

export function isPlatformAdminSession(session: Session): boolean {
  return isPlatformAdminRole(session.user.role);
}

export async function requirePlatformAdminAuth(): Promise<AuthPlatformAdminResult> {
  const auth = await requireAuth();
  if (!auth.success) {
    return auth;
  }

  if (!isPlatformAdminSession(auth.session)) {
    logPlatformSecurityAudit({
      event: "platform_admin_authz_denied",
      actorUserId: auth.session.user.id,
      outcome: "deny",
      reason: "not_platform_admin",
    });
    return {
      success: false,
      response: apiError("Forbidden", 403),
    };
  }

  return {
    success: true,
    session: auth.session,
  };
}

export async function requireElevatedPlatformAdminAuth(
  request: Request,
  action: SensitivePlatformAdminAction,
): Promise<ElevatedPlatformAdminResult> {
  const auth = await requirePlatformAdminAuth();
  if (!auth.success) {
    return auth;
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const parsedCookies = new Map(
    cookieHeader
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        const key = index >= 0 ? part.slice(0, index) : part;
        const value = index >= 0 ? part.slice(index + 1) : "";
        let decodedValue = value;
        try {
          decodedValue = decodeURIComponent(value);
        } catch {
          decodedValue = value;
        }
        return [key, decodedValue] as const;
      }),
  );

  const stepUpToken = parsedCookies.get(PLATFORM_ADMIN_STEP_UP_COOKIE);
  const validation = validateStepUpToken(stepUpToken);
  if (!validation.valid) {
    logPlatformSecurityAudit({
      event: "platform_admin_step_up_failed",
      actorUserId: auth.session.user.id,
      action,
      path: new URL(request.url).pathname,
      outcome: "deny",
      reason: `step_up_${validation.reason}`,
    });
    return {
      success: false,
      response: apiError("Step-up authentication required", 401),
    };
  }

  if (validation.payload.userId !== auth.session.user.id) {
    logPlatformSecurityAudit({
      event: "platform_admin_step_up_failed",
      actorUserId: auth.session.user.id,
      action,
      path: new URL(request.url).pathname,
      outcome: "deny",
      reason: "step_up_subject_mismatch",
    });
    return {
      success: false,
      response: apiError("Step-up authentication required", 401),
    };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: auth.session.user.id },
    select: { updatedAt: true },
  });

  if (!dbUser || isPrivilegedStepUpRevoked(validation.payload.issuedAt, dbUser.updatedAt)) {
    logPlatformSecurityAudit({
      event: "platform_admin_step_up_failed",
      actorUserId: auth.session.user.id,
      action,
      path: new URL(request.url).pathname,
      outcome: "deny",
      reason: "step_up_revoked",
    });
    return {
      success: false,
      response: apiError("Step-up authentication required", 401),
    };
  }

  logPlatformSecurityAudit({
    event: "platform_admin_sensitive_action_executed",
    actorUserId: auth.session.user.id,
    action,
    path: new URL(request.url).pathname,
    outcome: "allow",
  });

  return {
    success: true,
    session: auth.session,
  };
}
