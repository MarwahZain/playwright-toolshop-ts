import { request } from '@playwright/test';
import { AuthApi } from './api/AuthApi';
import fs from 'node:fs/promises';
import path from 'node:path';
import loginData from '../test-data/login.json';

export const AUTH_DIR = '.auth';

/** localStorage key the Toolshop Angular app reads to decide the user is signed in. */
const AUTH_TOKEN_KEY = 'auth-token';

export type Role = 'customer' | 'admin';

/** Path of the saved browser storageState (cookies + localStorage) for a role. */
export function storageStatePath(role: Role): string {
  return path.join(AUTH_DIR, `storage-state.${role}.json`);
}

/**
 * Logs in through the API for the given role and writes a storageState file
 * with the token in localStorage, so specs start already signed in.
 * No browser is needed: the file is written directly.
 */
async function saveStorageState(
  baseURL: string,
  role: Role,
  email: string,
  password: string,
): Promise<void> {
  const api = await request.newContext();
  try {
    const token = await new AuthApi(api).getToken(email, password);
    const storageState = {
      cookies: [],
      origins: [
        {
          origin: new URL(baseURL).origin,
          localStorage: [{ name: AUTH_TOKEN_KEY, value: token }],
        },
      ],
    };
    await fs.mkdir(AUTH_DIR, { recursive: true });
    await fs.writeFile(storageStatePath(role), JSON.stringify(storageState, null, 2));
  } catch (error) {
    throw new Error(`global-setup: could not log in as ${role} (${email}).`, { cause: error });
  } finally {
    await api.dispose();
  }
}

export default async function globalSetup(): Promise<void> {
  const baseURL = process.env.BASE_URL;
  const apiURL = process.env.API_URL;
  // Credentials come from the environment first, then fall back to test-data/login.json.
  const customerEmail = process.env.CUSTOMER_EMAIL || loginData.validCustomer.email;
  const customerPassword = process.env.CUSTOMER_PASSWORD || loginData.validCustomer.password;
  const adminEmail = process.env.ADMIN_EMAIL || loginData.validAdmin.email;
  const adminPassword = process.env.ADMIN_PASSWORD || loginData.validAdmin.password;

  if (!baseURL || !apiURL) {
    throw new Error('global-setup: BASE_URL and API_URL must be set in .env.');
  }
  if (!customerEmail || !customerPassword || !adminEmail || !adminPassword) {
    throw new Error(
      'global-setup: customer and admin credentials must be set in .env or test-data/login.json.',
    );
  }

  await saveStorageState(baseURL, 'customer', customerEmail, customerPassword);
  await saveStorageState(baseURL, 'admin', adminEmail, adminPassword);
}
