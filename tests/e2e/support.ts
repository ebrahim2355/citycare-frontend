import { type APIRequestContext, expect, type Page } from "@playwright/test";

export const ACCOUNTS = {
  admin: { email: "admin@citycare.com", password: "Admin12345" },
  staff: { email: "roads.staff@citycare.com", password: "Staff12345" },
  citizen: { email: "citizen@citycare.com", password: "Citizen12345" },
  neighbour: { email: "citizen2@citycare.com", password: "Citizen12345" },
} as const;

export type AccountName = keyof typeof ACCOUNTS;

export const storageStateOf = (name: AccountName) => `tests/e2e/.auth/${name}.json`;

export const uniqueTitle = (prefix: string) => `${prefix} ${Date.now().toString(36).toUpperCase()}`;

export const signIn = async (request: APIRequestContext, name: AccountName) => {
  const response = await request.post("/api/auth/login", { data: ACCOUNTS[name] });

  expect(response.ok(), `sign in as ${name}`).toBe(true);
};

export const backend = async <T>(page: Page, path: string, init: { method?: string; body?: unknown } = {}): Promise<T> => {
  const response = await page.request.fetch(`/api/backend${path}`, {
    method: init.method ?? "GET",
    ...(init.body !== undefined ? { data: init.body } : {}),
  });
  const body = await response.json();

  expect(response.ok(), `${init.method ?? "GET"} ${path}: ${JSON.stringify(body).slice(0, 300)}`).toBe(true);

  return body.data as T;
};

export const waitForMarkers = async (page: Page, regionName: string | RegExp) => {
  const markers = page.getByRole("region", { name: regionName }).locator("path.leaflet-interactive");

  await expect(markers.first()).toBeVisible({ timeout: 30 * 1000 });

  return markers;
};
