import { chromium, selectors } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { LoginPage } from './pages/LoginPage';
import { AccountPage } from './pages/AccountPage';
import loginData from '../test-data/login.json';

export const AUTH_DIR = '.auth';

export type Role = 'customer' | 'admin';

/** Path of the saved browser storageState (cookies + localStorage) for a role. */
export function storageStatePath(role: Role): string {
  return path.join(AUTH_DIR, `storage-state.${role}.json`);
}

/**
 * Logs in through the UI for the given role and saves the resulting
 * browser storageState so specs can start already signed in.
 */
async function saveStorageState(
  baseURL: string,
  role: Role,
  email: string,
  password: string,
): Promise<void> {
  // Global setup runs outside the test runner, so the config's testIdAttribute does not apply here.
  selectors.setTestIdAttribute('data-test');
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ baseURL });
    const page = context.pages()[0] ?? (await context.newPage());

    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(email, password);

    // Successful login navigates away from /auth/login; a failed one keeps the user there.
    await page.waitForURL((url) => !url.pathname.startsWith('/auth/login'));
    await new AccountPage(page).header.navMenu.waitFor();

    await fs.mkdir(AUTH_DIR, { recursive: true });
    await context.storageState({ path: storageStatePath(role) });
    await context.close();
  } catch (error) {
    throw new Error(`global-setup: could not log in as ${role} (${email}).`, { cause: error });
  } finally {
    await browser.close();
  }
}

export default async function globalSetup(): Promise<void> {
  const baseURL = process.env.BASE_URL;
  // Credentials come from the environment first, then fall back to test-data/login.json.
  const customerEmail = process.env.CUSTOMER_EMAIL || loginData.validCustomer.email;
  const customerPassword = process.env.CUSTOMER_PASSWORD || loginData.validCustomer.password;
  const adminEmail = process.env.ADMIN_EMAIL || loginData.validAdmin.email;
  const adminPassword = process.env.ADMIN_PASSWORD || loginData.validAdmin.password;

  if (!baseURL) {
    throw new Error('global-setup: BASE_URL must be set in .env.');
  }
  if (!customerEmail || !customerPassword || !adminEmail || !adminPassword) {
    throw new Error(
      'global-setup: customer and admin credentials must be set in .env or test-data/login.json.',
    );
  }

  await saveStorageState(baseURL, 'customer', customerEmail, customerPassword);
  await saveStorageState(baseURL, 'admin', adminEmail, adminPassword);
}
