import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { backend, storageStateOf, uniqueTitle } from "./support";

interface Category {
  id: string;
  name: string;
  type: "COMPLAINT" | "SERVICE";
}

interface PaymentMethods {
  methods: { method: string; available: boolean }[];
}

test.use({ storageState: storageStateOf("citizen") });

const requestService = async (page: Page, prefix: string) => {
  const categories = await backend<Category[]>(page, "/categories?limit=50");
  const service = categories.find((category) => category.type === "SERVICE");

  expect(service, "a paid service category exists").toBeDefined();

  return backend<{ id: string }>(page, "/complaints", {
    method: "POST",
    body: {
      title: uniqueTitle(prefix),
      description: "Two broken chairs and a table need to be collected from the gate.",
      categoryId: service?.id,
      address: "House 9, Road 3",
      area: "Dhanmondi",
    },
  });
};

const walletsReady = async (page: Page) => {
  const { methods } = await backend<PaymentMethods>(page, "/payments/methods");

  return methods.filter((item) => item.method !== "CARD").every((item) => item.available);
};

const pressOnSandbox = async (page: Page, button: "Success" | "Failed") => {
  await page.waitForURL(/sandbox\.sslcommerz\.com/, { timeout: 30 * 1000 });
  await page.locator(`input[type="submit"][value="${button}"]`).click();
};

test("the request page offers card, bKash and Nagad", async ({ page }) => {
  const request = await requestService(page, "E2E pickup to pay");

  await page.goto(`/dashboard/complaints/${request.id}`);

  const picker = page.getByRole("radiogroup", { name: "Payment method" });

  await expect(picker.getByRole("radio")).toHaveCount(3);
  await expect(picker.getByRole("radio", { name: /^Card/ })).toBeChecked();
  await expect(page.getByRole("button", { name: /^Pay .+ with Card$/ })).toBeVisible();

  if (await walletsReady(page)) {
    await picker.getByText("Pay from your bKash account").click();
    await expect(page.getByRole("button", { name: /^Pay .+ with bKash$/ })).toBeVisible();
    await expect(page.getByText("Sandbox: press Success on the SSLCommerz test page.")).toBeVisible();
  } else {
    await expect(picker.getByRole("radio", { name: /^bKash/ })).toBeDisabled();
  }
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`the payment picker has no serious accessibility problems in ${colorScheme}`, async ({ browser }) => {
    const context = await browser.newContext({ colorScheme, reducedMotion: "reduce", storageState: storageStateOf("citizen") });
    const page = await context.newPage();

    await page.goto("/dashboard");

    const request = await requestService(page, "E2E accessible pickup");

    await page.goto(`/dashboard/complaints/${request.id}`);
    await expect(page.getByRole("radiogroup", { name: "Payment method" })).toBeVisible();
    await page.waitForTimeout(1000);

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).exclude(".leaflet-container").analyze();
    const serious = results.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");

    expect(serious.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`)).toEqual([]);
    await context.close();
  });
}

test.describe("bKash and Nagad in the SSLCommerz sandbox", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    test.skip(!(await walletsReady(page)), "The API has no SSLCommerz store");
  });

  test("a citizen pays with bKash and gets the receipt", async ({ page }) => {
    const request = await requestService(page, "E2E bKash pickup");

    await page.goto(`/dashboard/complaints/${request.id}`);
    await page.getByRole("radiogroup", { name: "Payment method" }).getByText("Pay from your bKash account").click();
    await page.getByRole("button", { name: /^Pay .+ with bKash$/ }).click();
    await expect(page).toHaveURL(/cardname=bkash/, { timeout: 30 * 1000 });
    await pressOnSandbox(page, "Success");

    await expect(page).toHaveURL(/\/payment\/success\?tran_id=CC[0-9A-F]{24}$/, { timeout: 30 * 1000 });
    await expect(page.getByRole("heading", { name: "Payment successful" })).toBeVisible();

    const receipt = page.locator("dl:visible");

    await expect(receipt.getByText("bKash", { exact: true })).toBeVisible();
    await expect(receipt.getByText(/^BDT/)).toBeVisible();

    await page.getByRole("link", { name: "Open the request" }).click();
    await expect(page.getByText("Paid. The department has the request.")).toBeVisible();
  });

  test("a failed Nagad payment can be tried again", async ({ page }) => {
    const request = await requestService(page, "E2E Nagad pickup");

    await page.goto(`/dashboard/complaints/${request.id}`);
    await page.getByRole("radiogroup", { name: "Payment method" }).getByText("Pay from your Nagad account").click();
    await page.getByRole("button", { name: /^Pay .+ with Nagad$/ }).click();
    await pressOnSandbox(page, "Failed");

    await expect(page).toHaveURL(/\/payment\/cancel\?tran_id=CC[0-9A-F]{24}$/, { timeout: 30 * 1000 });
    await expect(page.getByRole("heading", { name: "Payment failed" })).toBeVisible();
    await page.getByRole("button", { name: "Try Nagad again" }).click();
    await expect(page).toHaveURL(/cardname=nagad/, { timeout: 30 * 1000 });
  });

  test("the wizard sends a new request straight to the chosen wallet", async ({ page }) => {
    await page.goto("/dashboard/complaints/new");
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();

    await page.getByRole("radio", { name: /Request a service/ }).click();
    await page.getByText("Bulk waste pickup", { exact: true }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByLabel("Short title").fill(uniqueTitle("E2E wizard bKash pickup"));
    await page.getByLabel("What is happening?").fill("An old wardrobe needs to be collected from the ground floor.");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByLabel("Area", { exact: true }).fill("Dhanmondi");
    await page.getByLabel("Address or landmark").fill("House 9, Road 3, beside the mosque");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Skip photos" }).click();

    await page.getByRole("radiogroup", { name: "Payment method" }).getByText("Pay from your bKash account").click();
    await expect(page.getByText(/on the next screen with bKash/)).toBeVisible();
    await page.getByRole("button", { name: /^Send and pay/ }).click();

    await expect(page).toHaveURL(/cardname=bkash/, { timeout: 30 * 1000 });
  });
});
