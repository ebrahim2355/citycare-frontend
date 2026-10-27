import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { type AccountName, storageStateOf } from "./support";

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
