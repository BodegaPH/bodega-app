import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import { requirePlatformAdminAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import {
  PLATFORM_ADMIN_STEP_UP_COOKIE,
  PLATFORM_ADMIN_STEP_UP_TTL_MS,
  issueStepUpToken,
  logPlatformSecurityAudit,
} from "@/lib/platform-admin-security";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

function createRateLimitHeaders(rateLimit: {
  limit: number;
  remaining: number;
  reset: number;
}) {
  return {
    "X-RateLimit-Limit": rateLimit.limit.toString(),
    "X-RateLimit-Remaining": rateLimit.remaining.toString(),
    "X-RateLimit-Reset": rateLimit.reset.toString(),
  };
}

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const ipRateLimit = checkRateLimit(`admin_step_up:ip:${clientIp}`, 10, 15 * 60 * 1000);
  if (!ipRateLimit.success) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: createRateLimitHeaders(ipRateLimit) },
    );
  }

  const auth = await requirePlatformAdminAuth();
  if (!auth.success) {
    return auth.response;
  }

  const userRateLimit = checkRateLimit(
    `admin_step_up:user:${auth.session.user.id}`,
    5,
    15 * 60 * 1000,
  );
  if (!userRateLimit.success) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: createRateLimitHeaders(userRateLimit) },
    );
  }

  const body = (await req.json().catch(() => null)) as
    | { password?: string }
    | null;
  const password = body?.password;
  if (!password) {
    logPlatformSecurityAudit({
      event: "platform_admin_step_up_failed",
      actorUserId: auth.session.user.id,
      path: "/api/admin/step-up",
      outcome: "deny",
      reason: "missing_password",
    });
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.session.user.id },
    select: { password: true },
  });

  const DUMMY_HASH =
    "$2b$10$K.0HwpsoPDGaB/JvnaHVk.OO7T8QkLn.Vy0tXKA1sLPvZTvg.xJNi";
  const hashToCompare = user?.password || DUMMY_HASH;
  const isValidPassword = await bcrypt.compare(password, hashToCompare);

  if (!user?.password || !isValidPassword) {
    logPlatformSecurityAudit({
      event: "platform_admin_step_up_failed",
      actorUserId: auth.session.user.id,
      path: "/api/admin/step-up",
      outcome: "deny",
      reason: "invalid_password",
    });
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = issueStepUpToken(auth.session.user.id);
  const res = NextResponse.json({
    success: true,
    expiresInMs: PLATFORM_ADMIN_STEP_UP_TTL_MS,
  });

  res.cookies.set({
    name: PLATFORM_ADMIN_STEP_UP_COOKIE,
    value: token,
    maxAge: Math.floor(PLATFORM_ADMIN_STEP_UP_TTL_MS / 1000),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  logPlatformSecurityAudit({
    event: "platform_admin_step_up_succeeded",
    actorUserId: auth.session.user.id,
    path: "/api/admin/step-up",
    outcome: "allow",
  });

  return res;
}
