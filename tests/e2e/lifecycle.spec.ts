import { expect, test } from "@playwright/test";
import { backend, storageStateOf, uniqueTitle } from "./support";

interface Complaint {
  id: string;
  trackingCode: string;
  status: string;
  isPublic: boolean;
  latitude: number | null;
}

test.describe.serial("a report from the citizen to the crew and back", () => {
  const title = uniqueTitle("E2E pothole by the lake bridge");
  let complaint: Complaint;

  test("a citizen reports a problem with the wizard and pins it on the map", async ({ browser }) => {
    const context = await browser.newContext({ storageState: storageStateOf("citizen") });
    const page = await context.newPage();

    await page.goto("/dashboard/complaints/new");
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();

    await page.getByText("Pothole", { exact: true }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByLabel("Short title").fill(title);
    await page.getByLabel("What is happening?").fill("A wide pothole in the middle of the lane. Cars swerve into the other lane to avoid it.");
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByLabel("Address or landmark").fill("Road 27, beside the lake bridge");

    const map = page.getByRole("region", { name: /drop a pin/i });

    await expect(map.locator(".leaflet-container")).toBeVisible();

    const box = await map.boundingBox();

    await page.mouse.click((box?.x ?? 0) + (box?.width ?? 0) / 2, (box?.y ?? 0) + (box?.height ?? 0) / 2);
    await expect(page.getByText(/Pin at \d+\.\d+, \d+\.\d+/)).toBeVisible();
    await expect(page.getByLabel("Area", { exact: true })).not.toHaveValue("");
    await expect(page.getByRole("switch", { name: "Show it on the public city map" })).toBeChecked();

    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Skip photos" }).click();
    await expect(page.getByText("Shown on the public city map")).toBeVisible();
    await page.getByRole("button", { name: "Send report" }).click();

    await expect(page).toHaveURL(/\/dashboard\/complaints\/[0-9a-f-]{36}$/);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();

    complaint = await backend<Complaint>(page, `/complaints/${page.url().split("/").pop()}`);
    expect(complaint).toMatchObject({ status: "SUBMITTED", isPublic: true });
    expect(complaint.latitude).not.toBeNull();

    await page.getByPlaceholder("Write a message").fill("The hole is right next to the zebra crossing.");
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await expect(page.getByRole("list", { name: "Messages" }).getByText("right next to the zebra crossing")).toBeVisible();
    await context.close();
  });

  test("an admin assigns it to a field staff member", async ({ browser }) => {
    const context = await browser.newContext({ storageState: storageStateOf("admin") });
    const page = await context.newPage();

    await page.goto(`/admin/complaints/${complaint.id}`);
    await page.getByRole("button", { name: "Assign staff" }).click();

    const dialog = page.getByRole("dialog");

    await dialog.getByLabel(/Rafiq Ahmed/).check();
    await dialog.getByRole("button", { name: "Assign selected" }).click();
    await expect(dialog).toBeHidden();
    await expect.poll(async () => (await backend<Complaint>(page, `/complaints/${complaint.id}`)).status).toBe("ASSIGNED");
    await context.close();
  });

  test("the staff member reads the message, starts and resolves the job", async ({ browser }) => {
    const context = await browser.newContext({ storageState: storageStateOf("staff") });
    const page = await context.newPage();

    await page.goto(`/staff/tasks/${complaint.id}`);
    await expect(page.getByRole("list", { name: "Messages" }).getByText("right next to the zebra crossing")).toBeVisible();

    await page.getByRole("switch", { name: /Internal note/ }).click();
    await page.getByPlaceholder("Write a note for the city team only").fill("Needs cold asphalt, the hot mix truck is booked.");
    await page.getByRole("button", { name: "Add note" }).click();
    await expect(page.getByRole("list", { name: "Messages" }).getByText("Internal note")).toBeVisible();

    await page.getByRole("button", { name: "Start work" }).click();
    await expect.poll(async () => (await backend<Complaint>(page, `/complaints/${complaint.id}`)).status).toBe("IN_PROGRESS");

    await page.getByRole("button", { name: "Mark as resolved" }).click();
    await page.getByRole("dialog").getByLabel("What did you do?").fill("Filled the hole with cold asphalt and compacted it.");
    await page.getByRole("dialog").getByRole("button", { name: "Mark as resolved" }).click();
    await expect.poll(async () => (await backend<Complaint>(page, `/complaints/${complaint.id}`)).status).toBe("RESOLVED");
    await context.close();
  });

  test("the citizen is notified, never sees the internal note and rates the work", async ({ browser }) => {
    const context = await browser.newContext({ storageState: storageStateOf("citizen") });
    const page = await context.newPage();

    await page.goto("/dashboard/notifications");
    await expect(page.getByText(`${complaint.trackingCode} · ${title} is fixed`)).toBeVisible();

    await page.goto(`/dashboard/complaints/${complaint.id}`);
    await expect(page.getByRole("list", { name: "Messages" }).getByText("cold asphalt")).toHaveCount(0);

    await page.getByRole("button", { name: "Rate the work" }).click();
    await page.getByRole("dialog").getByRole("radio", { name: "5 stars" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Send rating" }).click();
    await expect.poll(async () => (await backend<Complaint>(page, `/complaints/${complaint.id}`)).status).toBe("CLOSED");
    await context.close();
  });

  test("anyone can follow it with the tracking code", async ({ page }) => {
    await page.goto(`/track?code=${complaint.trackingCode}`);

    await expect(page.getByText(title)).toBeVisible();
    await expect(page.getByText("Closed").first()).toBeVisible();
  });
});
