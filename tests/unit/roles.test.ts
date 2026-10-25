import { describe, expect, it } from "vitest";
import { getAreaRole, getSafeRedirect, isGuestOnlyPath, ROLE_HOME } from "@/lib/roles";

describe("getAreaRole", () => {
  it("maps each dashboard area to its role", () => {
    expect(getAreaRole("/dashboard")).toBe("CITIZEN");
    expect(getAreaRole("/dashboard/complaints/new")).toBe("CITIZEN");
    expect(getAreaRole("/payment/success")).toBe("CITIZEN");
    expect(getAreaRole("/staff/tasks")).toBe("STAFF");
    expect(getAreaRole("/admin")).toBe("ADMIN");
  });

  it("does not treat look-alike paths as protected areas", () => {
    expect(getAreaRole("/administrator")).toBeNull();
    expect(getAreaRole("/staffing")).toBeNull();
    expect(getAreaRole("/")).toBeNull();
    expect(getAreaRole("/track")).toBeNull();
  });
});

describe("isGuestOnlyPath", () => {
  it("covers the sign in pages only", () => {
    expect(isGuestOnlyPath("/login")).toBe(true);
    expect(isGuestOnlyPath("/reset-password")).toBe(true);
    expect(isGuestOnlyPath("/loginx")).toBe(false);
    expect(isGuestOnlyPath("/dashboard")).toBe(false);
  });
});

describe("getSafeRedirect", () => {
  it("keeps a local path of the user's own area with its query", () => {
    expect(getSafeRedirect("/dashboard/complaints?status=SUBMITTED&page=2", "CITIZEN")).toBe(
      "/dashboard/complaints?status=SUBMITTED&page=2"
    );
    expect(getSafeRedirect("/track", "ADMIN")).toBe("/track");
  });

  it("sends a user away from another role's area", () => {
    expect(getSafeRedirect("/admin/users", "CITIZEN")).toBe(ROLE_HOME.CITIZEN);
    expect(getSafeRedirect("/dashboard#top", "STAFF")).toBe(ROLE_HOME.STAFF);
  });

  it.each([
    null,
    undefined,
    "",
    "dashboard",
    "https://evil.example/phish",
    "//evil.example/phish",
    "/\\evil.example/phish",
    "/\t/evil.example/phish",
    "/\n/evil.example",
    "javascript:alert(1)",
  ])("never leaves the site for %j", (value) => {
    expect(getSafeRedirect(value, "CITIZEN")).toBe(ROLE_HOME.CITIZEN);
  });
});
