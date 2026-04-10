import { describe, expect, it } from "vitest";
import {
  PLATFORM_ADMIN_STEP_UP_TTL_MS,
  issueStepUpToken,
  isPrivilegedStepUpRevoked,
  isSensitivePlatformAdminAction,
  validateStepUpToken,
} from "@/lib/platform-admin-security";

process.env.NEXTAUTH_SECRET = "test-nextauth-secret";

describe("platform-admin-security", () => {
  it("defines a sensitive action policy", () => {
    expect(isSensitivePlatformAdminAction("platform_admin.role_change")).toBe(true);
    expect(isSensitivePlatformAdminAction("platform_admin.unknown")).toBe(false);
  });

  it("issues and validates step-up tokens", () => {
    const now = Date.now();
    const token = issueStepUpToken("user_1", now);
    const validation = validateStepUpToken(token, now + 1000);
    expect(validation.valid).toBe(true);
    if (validation.valid) {
      expect(validation.payload.userId).toBe("user_1");
    }
  });

  it("fails validation after ttl expiry", () => {
    const now = Date.now();
    const token = issueStepUpToken("user_1", now);
    const validation = validateStepUpToken(token, now + PLATFORM_ADMIN_STEP_UP_TTL_MS + 1);
    expect(validation).toEqual({ valid: false, reason: "expired" });
  });

  it("revokes elevated context when user updatedAt is newer", () => {
    const now = Date.now();
    expect(isPrivilegedStepUpRevoked(now, new Date(now + 1))).toBe(true);
    expect(isPrivilegedStepUpRevoked(now, new Date(now))).toBe(false);
  });
});
