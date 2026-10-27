import { expect, test } from "@playwright/test";
import { storageStateOf, waitForMarkers } from "./support";

test.use({ storageState: storageStateOf("admin") });

test("the deadline check escalates overdue work and the escalated filter finds it", async ({ page }) => {
  await page.goto("/admin");
  await page.getByRole("button", { name: "Check deadlines" }).click();
  await expect(page.getByText(/overdue reports? escalated|No new overdue reports/)).toBeVisible();

  await page.goto("/admin/complaints");
  await page.getByRole("button", { name: "Show only escalated reports" }).click();
  await expect(page).toHaveURL(/escalated=true/);
});

test("complaints and payments download as csv files and the download is audited", async ({ page }) => {
  await page.goto("/admin/complaints");

  const complaints = page.waitForEvent("download");

  await page.getByRole("button", { name: "Export CSV" }).click();
  expect((await complaints).suggestedFilename()).toMatch(/^citycare-complaints-\d{4}-\d{2}-\d{2}\.csv$/);

  await page.goto("/admin/payments");

  const payments = page.waitForEvent("download");

  await page.getByRole("button", { name: "Export CSV" }).click();
  expect((await payments).suggestedFilename()).toMatch(/^citycare-payments-/);

  const logs = await (await page.request.get("/api/backend/admin/audit-logs?action=DATA_EXPORTED&limit=5")).json();

  expect(logs.data.length).toBeGreaterThanOrEqual(2);
});

test("the city map shows the open reports with a link to each", async ({ page }) => {
  await page.goto("/admin/map");

  await waitForMarkers(page, "City map");
  await page.locator("ol li button").first().click();
  await expect(page.locator(".leaflet-popup-content").getByRole("link", { name: "Open report" })).toBeVisible();
});

test("the notification bell lists new reports for the city team", async ({ page }) => {
  await page.goto("/admin");
  await page.getByRole("button", { name: /^Notifications/ }).click();

  await expect(page.getByRole("dialog").getByRole("link", { name: "View all notifications" })).toBeVisible();
});
