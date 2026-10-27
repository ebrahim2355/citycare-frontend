import { expect, test } from "@playwright/test";
import { waitForMarkers } from "./support";

interface PublicReport {
  trackingCode: string;
  title: string;
}

test.describe("public site", () => {
  test("home shows the city numbers, the main navigation and strict security headers", async ({ page }) => {
    const response = await page.goto("/");
    const headers = response?.headers() ?? {};

    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("region", { name: "City numbers" })).toBeVisible();

    const nav = page.getByRole("navigation", { name: "Main" });

    for (const name of ["Services", "Track", "Issue map", "About", "FAQ", "Contact"]) {
      await expect(nav.getByRole("link", { name, exact: true })).toBeVisible();
    }
  });

  test("services list the categories with their fees", async ({ page }) => {
    await page.goto("/services");

    await expect(page.getByText("Bulk waste pickup").first()).toBeVisible();
    await expect(page.getByText("$15.00").first()).toBeVisible();
  });

  test("the issue map shows public reports and opens one", async ({ page }) => {
    await page.goto("/map");

    const markers = await waitForMarkers(page, "City issue map");

    expect(await markers.count()).toBeGreaterThan(0);
    await page.locator("aside ol li button").first().click();

    const popup = page.locator(".leaflet-popup-content");

    await expect(popup.getByRole("link", { name: "Track" })).toBeVisible();
    await expect(popup.getByRole("link", { name: "Sign in to support" })).toBeVisible();
  });

  test("a tracking code shows the progress of a report", async ({ page, request }) => {
    const reports = (await (await request.get("/api/backend/complaints/public")).json()).data as PublicReport[];
    const report = reports[0];

    expect(report).toBeTruthy();
    await page.goto(`/track?code=${report?.trackingCode}`);

    await expect(page.getByText(report?.title ?? "")).toBeVisible();
    await expect(page.getByRole("heading", { name: "History" })).toBeVisible();
  });

  test("an unknown page answers 404 with a way back", async ({ page }) => {
    const response = await page.goto("/this-street-does-not-exist");

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "This street is not on our map" })).toBeVisible();
  });
});
