/**
 * Redirect Helper - Auth Infrastructure
 * 
 * NOTE: This file uses direct Prisma queries as part of the auth/routing infrastructure.
 * This is an acceptable boundary exception since it's tightly coupled with NextAuth session
 * management and redirect logic, not domain business logic.
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isPlatformAdminRole } from "@/lib/system-role";

const AUTH_PATH_PREFIX = "/auth";
const ONBOARDING_DEFAULT_PATH = "/onboarding/create-org";
const PLATFORM_ADMIN_DEFAULT_PATH = "/admin";
const ORG_DASHBOARD_SUFFIX = "dashboard";

export type RouteClass = "auth" | "admin" | "org" | "onboarding" | "other";

interface RedirectPolicyInput {
  callbackUrl?: string | null;
  currentPath?: string;
}

interface RedirectPolicyResult {
  destination: string;
  routeClass: RouteClass;
}

function classifyRoute(path: string): RouteClass {
  if (path.startsWith("/auth")) return "auth";
  if (path === "/admin" || path.startsWith("/admin/")) return "admin";
  if (path.startsWith("/onboarding")) return "onboarding";

  const segments = path.split("/").filter(Boolean);
  if (segments.length >= 2) {
    return "org";
  }

  return "other";
}

function sanitizeInternalCallback(
  callbackUrl: string | null | undefined,
  origin: string,
): string | null {
  if (!callbackUrl) return null;

  try {
    const parsed = new URL(callbackUrl, origin);
    if (parsed.origin !== origin) return null;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

function canPrincipalAccessRoute(routeClass: RouteClass, isPlatformAdmin: boolean): boolean {
  if (isPlatformAdmin) {
    return routeClass !== "auth";
  }

  return routeClass !== "admin";
}

function isRedirectLoop(currentPath: string | undefined, destination: string): boolean {
  if (!currentPath) return false;
  return currentPath === destination;
}

async function resolveOrgDefaultPath(userId: string, activeOrgId?: string | null): Promise<string> {
  const memberships = await prisma.membership.findMany({
    where: { userId },
    select: { orgId: true },
    orderBy: { createdAt: "asc" },
  });

  if (memberships.length === 0) {
    return ONBOARDING_DEFAULT_PATH;
  }

  const validActiveOrgId =
    activeOrgId && memberships.some((membership) => membership.orgId === activeOrgId)
      ? activeOrgId
      : memberships[0].orgId;

  return `/${validActiveOrgId}/${ORG_DASHBOARD_SUFFIX}`;
}

export async function resolveCanonicalDestination(
  input: RedirectPolicyInput = {},
): Promise<RedirectPolicyResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      destination: "/auth/signin",
      routeClass: "auth",
    };
  }

  const isPlatformAdmin = isPlatformAdminRole(session.user.role);
  const origin = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const sanitizedCallback = sanitizeInternalCallback(input.callbackUrl, origin);

  if (sanitizedCallback) {
    const routeClass = classifyRoute(sanitizedCallback);
    if (
      canPrincipalAccessRoute(routeClass, isPlatformAdmin) &&
      !isRedirectLoop(input.currentPath, sanitizedCallback)
    ) {
      return {
        destination: sanitizedCallback,
        routeClass,
      };
    }
  }

  const defaultDestination = isPlatformAdmin
    ? PLATFORM_ADMIN_DEFAULT_PATH
    : await resolveOrgDefaultPath(session.user.id, session.user.activeOrgId);

  if (isRedirectLoop(input.currentPath, defaultDestination)) {
    const routeClass = classifyRoute(defaultDestination);
    return {
      destination: defaultDestination,
      routeClass,
    };
  }

  return {
    destination: defaultDestination,
    routeClass: classifyRoute(defaultDestination),
  };
}

export async function redirectByCanonicalPolicy(input: RedirectPolicyInput = {}) {
  const result = await resolveCanonicalDestination(input);
  redirect(result.destination);
}

export async function redirectToOrgScopedPath(path: string) {
  if (!path) {
    return redirectByCanonicalPolicy();
  }

  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return redirectByCanonicalPolicy({ callbackUrl: `/${normalizedPath}` });
}
