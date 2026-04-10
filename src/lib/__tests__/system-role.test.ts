import { describe, expect, it } from "vitest";
import {
  canRemoveLegacyRoleCompatibility,
  isPlatformAdminRole,
  normalizeSystemRole,
} from "@/lib/system-role";

describe("system-role compatibility", () => {
  it("supports dual-value platform admin authorization", () => {
    expect(isPlatformAdminRole("SYSTEM_ADMIN")).toBe(true);
    expect(isPlatformAdminRole("PLATFORM_ADMIN")).toBe(true);
    expect(isPlatformAdminRole("USER")).toBe(false);
  });

  it("issues canonical PLATFORM_ADMIN role", () => {
    expect(normalizeSystemRole("SYSTEM_ADMIN")).toBe("PLATFORM_ADMIN");
    expect(normalizeSystemRole("PLATFORM_ADMIN")).toBe("PLATFORM_ADMIN");
  });

  it("keeps compatibility enabled while legacy observations exist", () => {
    expect(
      canRemoveLegacyRoleCompatibility({
        hasLegacyRoleObservations: true,
        ttlBufferElapsed: true,
      }),
    ).toBe(false);
  });

  it("blocks cleanup until ttl buffer completes with zero observations", () => {
    expect(
      canRemoveLegacyRoleCompatibility({
        hasLegacyRoleObservations: false,
        ttlBufferElapsed: false,
      }),
    ).toBe(false);
  });

  it("allows cleanup only when zero observations and ttl buffer elapsed", () => {
    expect(
      canRemoveLegacyRoleCompatibility({
        hasLegacyRoleObservations: false,
        ttlBufferElapsed: true,
      }),
    ).toBe(true);
  });
});
