import { describe, expect, it } from "vitest";
import { authOptions } from "@/lib/auth";

describe("auth canonical role issuance", () => {
  it("normalizes legacy SYSTEM_ADMIN to PLATFORM_ADMIN in jwt/session callbacks", async () => {
    const jwtCb = authOptions.callbacks?.jwt;
    const sessionCb = authOptions.callbacks?.session;

    expect(jwtCb).toBeDefined();
    expect(sessionCb).toBeDefined();

    const token = await jwtCb!({
      token: { id: "u1", role: "USER" },
      user: { id: "u1", role: "SYSTEM_ADMIN" },
      account: null,
      profile: undefined,
      trigger: "signIn",
      isNewUser: false,
      session: undefined,
    } as never);

    expect(token.role).toBe("PLATFORM_ADMIN");

    const session = await sessionCb!({
      session: {
        user: { id: "", role: "USER", activeOrgId: null },
        expires: new Date(Date.now() + 60_000).toISOString(),
      },
      token,
      user: {} as never,
      newSession: undefined,
      trigger: "update",
    } as never);

    expect((session.user as { role: string }).role).toBe("PLATFORM_ADMIN");
  });

  it("keeps canonical PLATFORM_ADMIN issuance when compatibility remains enabled", async () => {
    const jwtCb = authOptions.callbacks?.jwt;
    const sessionCb = authOptions.callbacks?.session;

    expect(jwtCb).toBeDefined();
    expect(sessionCb).toBeDefined();

    const legacyToken = await jwtCb!({
      token: { id: "legacy-user", role: "USER" },
      user: { id: "legacy-user", role: "SYSTEM_ADMIN" },
      account: null,
      profile: undefined,
      trigger: "signIn",
      isNewUser: false,
      session: undefined,
    } as never);

    const canonicalToken = await jwtCb!({
      token: { id: "new-user", role: "USER" },
      user: { id: "new-user", role: "PLATFORM_ADMIN" },
      account: null,
      profile: undefined,
      trigger: "signIn",
      isNewUser: false,
      session: undefined,
    } as never);

    expect(legacyToken.role).toBe("PLATFORM_ADMIN");
    expect(canonicalToken.role).toBe("PLATFORM_ADMIN");

    const legacySession = await sessionCb!({
      session: {
        user: { id: "", role: "USER", activeOrgId: null },
        expires: new Date(Date.now() + 60_000).toISOString(),
      },
      token: legacyToken,
      user: {} as never,
      newSession: undefined,
      trigger: "update",
    } as never);

    const canonicalSession = await sessionCb!({
      session: {
        user: { id: "", role: "USER", activeOrgId: null },
        expires: new Date(Date.now() + 60_000).toISOString(),
      },
      token: canonicalToken,
      user: {} as never,
      newSession: undefined,
      trigger: "update",
    } as never);

    expect((legacySession.user as { role: string }).role).toBe("PLATFORM_ADMIN");
    expect((canonicalSession.user as { role: string }).role).toBe("PLATFORM_ADMIN");
  });
});
