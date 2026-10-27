import { expect, test } from "@playwright/test";
import { storageStateOf, waitForMarkers } from "./support";

test("the mobile menu reaches the issue map", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("navigation", { name: "Mobile" }).getByRole("link", { name: "Issue map" }).click();

  await expect(page).toHaveURL(/\/map$/);
  await waitForMarkers(page, "City issue map");
});

test.describe("signed in on a phone", () => {
  test.use({ storageState: storageStateOf("staff") });

  test("field staff open the jobs map from the side menu", async ({ page }) => {
    await page.goto("/staff");
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.getByRole("dialog").getByRole("link", { name: "Jobs map" }).click();

    await expect(page).toHaveURL(/\/staff\/map$/);
    await expect(page.getByRole("heading", { name: "Jobs map" })).toBeVisible();
  });
});
