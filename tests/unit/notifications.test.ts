import { describe, expect, it } from "vitest";
import { badgeCount, complaintHref, NOTIFICATION_STYLE, notificationHref, notificationsHref } from "@/lib/notifications";
import type { NotificationType } from "@/types";

const TYPES: NotificationType[] = [
  "COMPLAINT_SUBMITTED",
  "COMPLAINT_ASSIGNED",
  "COMPLAINT_UNASSIGNED",
  "COMPLAINT_STATUS_CHANGED",
  "COMPLAINT_REOPENED",
  "COMPLAINT_TRANSFERRED",
  "COMMENT_ADDED",
  "FEEDBACK_RECEIVED",
  "PAYMENT_RECEIVED",
  "PAYMENT_REFUNDED",
  "SLA_BREACHED",
  "REPORT_SUPPORTED",
];

describe("notification links", () => {
  it("opens the complaint in the area of each role", () => {
    expect(complaintHref("CITIZEN", "c1")).toBe("/dashboard/complaints/c1");
    expect(complaintHref("STAFF", "c1")).toBe("/staff/tasks/c1");
    expect(complaintHref("ADMIN", "c1")).toBe("/admin/complaints/c1");
  });

  it("never sends staff to a job that was moved away from them", () => {
    const complaint = { id: "c1", trackingCode: "CC-1" };

    expect(notificationHref("STAFF", { type: "COMPLAINT_UNASSIGNED", complaint })).toBeNull();
    expect(notificationHref("STAFF", { type: "COMPLAINT_ASSIGNED", complaint })).toBe("/staff/tasks/c1");
    expect(notificationHref("CITIZEN", { type: "COMPLAINT_STATUS_CHANGED", complaint })).toBe("/dashboard/complaints/c1");
    expect(notificationHref("ADMIN", { type: "SLA_BREACHED", complaint: null })).toBeNull();
  });

  it("points each role to its own notification page", () => {
    expect(notificationsHref("CITIZEN")).toBe("/dashboard/notifications");
    expect(notificationsHref("STAFF")).toBe("/staff/notifications");
    expect(notificationsHref("ADMIN")).toBe("/admin/notifications");
  });
});

describe("notification style", () => {
  it.each(TYPES)("has an icon and a colour for %s", (type) => {
    expect(NOTIFICATION_STYLE[type].icon).toBeTruthy();
    expect(NOTIFICATION_STYLE[type].tone).toMatch(/^bg-/);
  });

  it("caps the badge at 9+", () => {
    expect(badgeCount(3)).toBe("3");
    expect(badgeCount(9)).toBe("9");
    expect(badgeCount(42)).toBe("9+");
  });
});
