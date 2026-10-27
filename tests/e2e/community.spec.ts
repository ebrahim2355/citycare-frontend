import { expect, test } from "@playwright/test";
import { backend, storageStateOf } from "./support";

interface PublicReport {
  id: string;
  trackingCode: string;
  status: string;
  latitude: number;
  longitude: number;
  category: { name: string };
}

const OPEN = ["SUBMITTED", "ASSIGNED", "IN_PROGRESS"];

test.use({ storageState: storageStateOf("neighbour") });

const otherPeoplesReport = async (page: import("@playwright/test").Page) => {
  const reports = await backend<PublicReport[]>(page, "/complaints/public");
  const own = new Set((await backend<{ id: string }[]>(page, "/complaints?limit=100")).map((item) => item.id));
  const report = reports.find((item) => !own.has(item.id) && OPEN.includes(item.status));

  expect(report, "an open public report of another citizen").toBeTruthy();

  return report as PublicReport;
};

test("a neighbour adds their voice to a public report from the tracking page", async ({ page }) => {
  await page.goto("/dashboard");

  const report = await otherPeoplesReport(page);

  await page.goto(`/track?code=${report.trackingCode}`);
  await expect(page.getByRole("region", { name: /Map of the report/ }).locator(".citycare-pin")).toBeVisible();

  const button = page.getByRole("button", { name: /Support this report|Withdraw your support/ });

  if ((await button.getAttribute("aria-pressed")) === "true") {
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "false");
  }

  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Thanks. You are counted as affected too.")).toBeVisible();
});

test("the wizard points to the same problem nearby before a duplicate is sent", async ({ page }) => {
  await page.goto("/dashboard/complaints/new");

  const report = await otherPeoplesReport(page);

  await page.evaluate(
    ({ latitude, longitude }) => {
      sessionStorage.setItem(
        "citycare-report-draft",
        JSON.stringify({ state: { step: "category", kind: "COMPLAINT", values: { latitude, longitude } }, version: 0 })
      );
    },
    { latitude: report.latitude, longitude: report.longitude }
  );
  await page.reload();

  await page.getByText(report.category.name, { exact: true }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Short title").fill("Looks like the same problem");
  await page.getByLabel("What is happening?").fill("I think somebody already reported this one nearby.");
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByText(/already reported this nearby|similar reports are already open nearby/)).toBeVisible();
});
