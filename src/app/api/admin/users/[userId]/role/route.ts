import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireElevatedPlatformAdminAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import {
  isSensitivePlatformAdminAction,
  logPlatformSecurityAudit,
} from "@/lib/platform-admin-security";

const ROLE_CHANGE_ACTION = "platform_admin.role_change";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  if (!isSensitivePlatformAdminAction(ROLE_CHANGE_ACTION)) {
    return NextResponse.json({ error: "Security policy misconfiguration" }, { status: 500 });
  }

  const auth = await requireElevatedPlatformAdminAuth(req, ROLE_CHANGE_ACTION);
  if (!auth.success) {
    return auth.response;
  }

  const { userId } = await params;
  const payload = (await req.json().catch(() => null)) as { role?: string } | null;
  const requestedRole = payload?.role;

  if (!requestedRole) {
    return NextResponse.json({ error: "Role is required" }, { status: 400 });
  }

  if (requestedRole !== "USER" && requestedRole !== "PLATFORM_ADMIN") {
    return NextResponse.json(
      { error: "Role must be exactly one of: USER, PLATFORM_ADMIN" },
      { status: 400 },
    );
  }

  const canonicalRole = requestedRole;

  if (auth.session.user.id === userId && canonicalRole === "USER") {
    return NextResponse.json(
      { error: "Platform admins cannot demote their own account" },
      { status: 400 },
    );
  }

  let user: { id: string; systemRole: string; updatedAt: Date };
  try {
    user = await prisma.user.update({
      where: { id: userId },
      data: { systemRole: canonicalRole },
      select: { id: true, systemRole: true, updatedAt: true },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  logPlatformSecurityAudit({
    event: "platform_admin_sensitive_action_executed",
    actorUserId: auth.session.user.id,
    action: ROLE_CHANGE_ACTION,
    path: `/api/admin/users/${userId}/role`,
    outcome: "allow",
  });

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      role: user.systemRole,
      updatedAt: user.updatedAt,
    },
  });
}
