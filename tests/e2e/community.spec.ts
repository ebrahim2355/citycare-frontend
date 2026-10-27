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

interface OwnReport {
  trackingCode: string;
  status: string;
  isPublic: boolean;
  latitude: number | null;
}

const OPEN = ["SUBMITTED", "ASSIGNED", "IN_PROGRESS"];

const SUPPORT_BUTTON = /^(Me too|Supported)/;

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
  const tracked = await backend<{ supportedByMe: boolean }>(page, `/complaints/track/${report.trackingCode}`);

  await page.goto(`/track?code=${report.trackingCode}`);
  await expect(page.getByRole("region", { name: /Map of the report/ }).locator(".citycare-pin")).toBeVisible();

  const button = page.getByRole("button", { name: SUPPORT_BUTTON });

  await expect(button).toHaveAttribute("aria-pressed", String(tracked.supportedByMe));

  if (tracked.supportedByMe) {
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "false");
  }

  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Thanks. You are counted as affected too.")).toBeVisible();

  const count = Number((await button.innerText()).match(/\d+/)?.[0]);

  await expect(page.getByText(`${count} ${count === 1 ? "neighbour says" : "neighbours say"} this affects them too.`)).toBeVisible();
});

test("the owner of a public report sees its supporters instead of a support button", async ({ browser }) => {
  const context = await browser.newContext({ storageState: storageStateOf("citizen") });
  const page = await context.newPage();

  await page.goto("/dashboard");

  const own = await backend<OwnReport[]>(page, "/complaints?limit=100");
  const report = own.find((item) => item.isPublic && item.latitude !== null && OPEN.includes(item.status));

  expect(report, "an open public report of the citizen").toBeTruthy();
  await page.goto(`/track?code=${report?.trackingCode}`);
  await expect(page.getByText(/^\d+ supporters?$/)).toBeVisible();
  await expect(page.getByRole("button", { name: SUPPORT_BUTTON })).toHaveCount(0);
  await context.close();
});

test("the wizard points to the same problem nearby and adding a voice there keeps the draft open", async ({ page }) => {
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

  await page.getByLabel("Area", { exact: true }).fill("Dhanmondi");
  await page.getByLabel("Address or landmark").fill("Right where the other report is");

  const voice = page.getByRole("button", { name: SUPPORT_BUTTON }).first();
  const pressed = await voice.getAttribute("aria-pressed");

  await voice.click();
  await expect(voice).toHaveAttribute("aria-pressed", pressed === "true" ? "false" : "true");
  await expect(page.getByText("Where is it?")).toBeVisible();
  await expect(page.getByRole("button", { name: "Skip photos" })).toHaveCount(0);
});
