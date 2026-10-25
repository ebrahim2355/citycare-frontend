import { describe, expect, it } from "vitest";
import {
  formatBytes,
  formatDate,
  formatDateTime,
  formatHours,
  formatMoney,
  formatRelative,
  formatSla,
  humanize,
  initials,
  pluralize,
} from "@/lib/format";

describe("dates", () => {
  it("shows dates in Dhaka time, whatever the time zone of the browser", () => {
    expect(formatDate("2026-10-28T20:00:00Z")).toBe("29 Oct 2026");
    expect(formatDateTime("2026-10-28T06:30:00Z")).toMatch(/^28 Oct 2026.*12:30\s?pm$/i);
  });

  it("shows a dash for a missing date", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDateTime(undefined)).toBe("—");
  });

  it("describes a moment relative to now", () => {
    const now = Date.parse("2026-10-28T12:00:00Z");

    expect(formatRelative(new Date(now - 5 * 3600 * 1000), now)).toBe("5 hours ago");
    expect(formatRelative(new Date(now + 2 * 24 * 3600 * 1000), now)).toBe("in 2 days");
    expect(formatRelative(new Date(now - 24 * 3600 * 1000), now)).toBe("yesterday");
    expect(formatRelative(new Date(now - 20 * 1000), now)).toBe("just now");
  });
});

describe("numbers", () => {
  it("formats money from numbers and decimal strings", () => {
    expect(formatMoney(15)).toBe("$15.00");
    expect(formatMoney("15.5")).toBe("$15.50");
    expect(formatMoney(null)).toBe("$0.00");
    expect(formatMoney("not a number")).toBe("$0.00");
    expect(formatMoney(10, "bdt")).toMatch(/^BDT\s10\.00$/);
  });

  it("turns hours into a short duration", () => {
    expect(formatHours(0.25)).toBe("15 min");
    expect(formatHours(5.25)).toBe("5.3 h");
    expect(formatHours(24)).toBe("1 day");
    expect(formatHours(36)).toBe("1.5 days");
    expect(formatHours(null)).toBe("—");
  });

  it("describes a category deadline", () => {
    expect(formatSla(24)).toBe("1 day");
    expect(formatSla(72)).toBe("3 days");
    expect(formatSla(36)).toBe("36 hours");
  });

  it("formats file sizes", () => {
    expect(formatBytes(0)).toBe("—");
    expect(formatBytes(2048)).toBe("2 KB");
    expect(formatBytes(3 * 1024 * 1024)).toBe("3.0 MB");
  });
});

describe("text", () => {
  it("builds initials from the first two names", () => {
    expect(initials("Rafiq Ahmed Khan")).toBe("RA");
    expect(initials("  mitu  ")).toBe("M");
  });

  it("pluralizes with grouped numbers", () => {
    expect(pluralize(1, "report")).toBe("1 report");
    expect(pluralize(1200, "report")).toBe("1,200 reports");
    expect(pluralize(2, "person", "people")).toBe("2 people");
  });

  it("turns enum values into words", () => {
    expect(humanize("IN_PROGRESS")).toBe("In progress");
    expect(humanize("PENDING_PAYMENT")).toBe("Pending payment");
  });
});
