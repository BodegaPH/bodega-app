import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = ["/auth/signin", "/auth/signup"];

function isPlatformAdminRole(role: unknown) {
  return role === "SYSTEM_ADMIN" || role === "PLATFORM_ADMIN";
}

function isAuthPath(pathname: string) {
  return pathname.startsWith("/auth");
}

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isOrgPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return segments.length >= 2 && segments[0] !== "auth" && segments[0] !== "api" && segments[0] !== "onboarding" && segments[0] !== "admin";
}

export function isSafeCallbackUrl(callbackUrl: string | null): callbackUrl is string {
  if (!callbackUrl) return false;
  if (!callbackUrl.startsWith("/")) return false;
  if (callbackUrl.startsWith("//")) return false;
  if (callbackUrl.startsWith("/auth")) return false;
  return true;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const role = token?.role;
  const isPlatformAdmin = isPlatformAdminRole(role);

  // API routes: require auth
  if (pathname.startsWith("/api")) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Public paths: allow through
  if (PUBLIC_PATHS.includes(pathname)) {
    // If already authenticated, redirect away from auth pages
    if (token) {
      const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
      if (isSafeCallbackUrl(callbackUrl)) {
        return NextResponse.redirect(new URL(callbackUrl, req.url));
      }

      const target = isPlatformAdmin ? "/admin" : "/";
      if (pathname !== target) {
        return NextResponse.redirect(new URL(target, req.url));
      }
    }
    return NextResponse.next();
  }

  // Protected routes: require auth
  if (!token) {
    const signInUrl = new URL("/auth/signin", req.url);
    const callbackUrl = `${pathname}${req.nextUrl.search}`;
    signInUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(signInUrl);
  }

  if (isAdminPath(pathname) && !isPlatformAdmin) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isPlatformAdmin && (isOrgPath(pathname) || pathname.startsWith("/onboarding"))) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (!isPlatformAdmin && isAdminPath(pathname)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (token && isAuthPath(pathname)) {
    const target = isPlatformAdmin ? "/admin" : "/";
    if (pathname !== target) {
      return NextResponse.redirect(new URL(target, req.url));
    }
  }

  // Add pathname header for server components
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
