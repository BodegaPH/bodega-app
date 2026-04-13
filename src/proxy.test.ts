import { describe, expect, it } from "vitest";
import { isSafeCallbackUrl } from "@/proxy";

describe("isSafeCallbackUrl", () => {
  it("accepts safe internal non-auth paths", () => {
    expect(isSafeCallbackUrl("/org_1/dashboard")).toBe(true);
    expect(isSafeCallbackUrl("/onboarding/create-org")).toBe(true);
  });

  it("rejects unsafe callback urls", () => {
    expect(isSafeCallbackUrl(null)).toBe(false);
    expect(isSafeCallbackUrl("https://evil.com")).toBe(false);
    expect(isSafeCallbackUrl("//evil.com/path")).toBe(false);
    expect(isSafeCallbackUrl("/auth/signin")).toBe(false);
    expect(isSafeCallbackUrl("/auth/signup?x=1")).toBe(false);
  });
});
