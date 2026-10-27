import { test as setup } from "@playwright/test";
import { ACCOUNTS, type AccountName, signIn, storageStateOf } from "./support";

for (const name of Object.keys(ACCOUNTS) as AccountName[]) {
  setup(`sign in as ${name}`, async ({ request }) => {
    await signIn(request, name);
    await request.storageState({ path: storageStateOf(name) });
  });
}
