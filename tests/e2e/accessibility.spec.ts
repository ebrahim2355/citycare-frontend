import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { type AccountName, storageStateOf, waitForMarkers } from "./support";

const PAGES: { path: string; as?: AccountName }[] = [
  { path: "/" },
  { path: "/map" },
  { path: "/services" },
  { path: "/track" },
  { path: "/login" },
  { path: "/dashboard", as: "citizen" },
  { path: "/dashboard/complaints/new", as: "citizen" },
  { path: "/dashboard/notifications", as: "citizen" },
  { path: "/staff/tasks", as: "staff" },
  { path: "/staff/map", as: "staff" },
  { path: "/admin", as: "admin" },
  { path: "/admin/complaints", as: "admin" },
];

for (const item of PAGES) {
  test(`${item.path}${item.as ? ` as ${item.as}` : ""} has no serious accessibility problems`, async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce", ...(item.as ? { storageState: storageStateOf(item.as) } : {}) });
    const page = await context.newPage();

    await page.goto(item.path);
    await page.waitForLoadState("load");
    await page.waitForTimeout(1500);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .exclude(".leaflet-container")
      .analyze();
    const serious = results.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");

    expect(serious.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`)).toEqual([]);
    await context.close();
  });
}

for (const colorScheme of ["light", "dark"] as const) {
  test(`map popups follow the ${colorScheme} theme`, async ({ browser }) => {
    const context = await browser.newContext({ colorScheme, reducedMotion: "reduce", storageState: storageStateOf("admin") });
    const page = await context.newPage();

    await page.goto("/admin/map");
    await waitForMarkers(page, "City map");
    await page.locator("ol li button").first().click();

    const popup = page.locator(".leaflet-popup");
    const openReport = popup.getByRole("link", { name: "Open report" });

    await expect(openReport).toBeVisible();

    const theme = await page.evaluate(() => {
      const probe = document.createElement("span");

      probe.style.cssText = "background-color: var(--popover); color: var(--primary-foreground)";
      document.body.append(probe);

      const { backgroundColor, color } = getComputedStyle(probe);

      probe.remove();

      return { backgroundColor, color };
    });

    await expect(popup.locator(".leaflet-popup-content-wrapper")).toHaveCSS("background-color", theme.backgroundColor);
    await expect(openReport).toHaveCSS("color", theme.color);

    const results = await new AxeBuilder({ page }).include(".leaflet-popup").withTags(["wcag2a", "wcag2aa"]).analyze();

    expect(results.violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`)).toEqual([]);
    await context.close();
  });
}
