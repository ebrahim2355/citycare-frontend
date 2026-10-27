import { expect, test } from "@playwright/test";
import { ACCOUNTS, storageStateOf } from "./support";

test.describe("signing in", () => {
  test("a visitor is sent to sign in and comes back to the page afterwards", async ({ page }) => {
    await page.goto("/dashboard/payments");
    await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard%2Fpayments$/);

    await page.getByLabel("Email").fill(ACCOUNTS.citizen.email);
    await page.getByLabel("Password", { exact: true }).fill(ACCOUNTS.citizen.password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    await expect(page).toHaveURL(/\/dashboard\/payments$/);
    await expect(page.getByRole("heading", { name: "Payments" })).toBeVisible();
  });

  test("a wrong password is refused with a clear message", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(ACCOUNTS.citizen.email);
    await page.getByLabel("Password", { exact: true }).fill("NotThePassword1");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    await expect(page.getByText("Invalid credentials").first()).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  for (const [label, area] of [
    ["City admin", "/admin"],
    ["Field staff", "/staff"],
    ["Citizen", "/dashboard"],
  ] as const) {
    test(`the demo button signs in the ${label.toLowerCase()} to ${area}`, async ({ page }) => {
      await page.goto("/login");
      await page.getByRole("button", { name: `Demo login as ${label}` }).click();

      await expect(page).toHaveURL(new RegExp(`${area}$`));
    });
  }

  test("every role stays inside its own area", async ({ browser }) => {
    const citizen = await browser.newContext({ storageState: storageStateOf("citizen") });
    const staff = await browser.newContext({ storageState: storageStateOf("staff") });
    const citizenPage = await citizen.newPage();
    const staffPage = await staff.newPage();

    await citizenPage.goto("/admin/users");
    await expect(citizenPage).toHaveURL(/\/dashboard$/);
    await staffPage.goto("/dashboard/complaints");
    await expect(staffPage).toHaveURL(/\/staff$/);

    const blocked = await citizenPage.request.get("/api/backend/admin/users");

    expect(blocked.status()).toBe(403);
    await citizen.close();
    await staff.close();
  });

  test("signing out ends the session", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Demo login as Citizen" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.getByRole("button", { name: /Demo Citizen/ }).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();

    await expect(page).toHaveURL(/\/login/);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard$/);
  });
});
