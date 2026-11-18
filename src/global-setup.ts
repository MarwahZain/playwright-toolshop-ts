import { request } from '@playwright/test';
import { AuthApi } from './api/AuthApi';
import fs from 'node:fs/promises';
import path from 'node:path';
import { testEnv } from './config/environments';
import { admin, customer } from './config/accounts';

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
  // URLs come from TEST_ENV, accounts from environment variables or login.json.
  await saveStorageState(testEnv.baseURL, 'customer', customer.email, customer.password);
  await saveStorageState(testEnv.baseURL, 'admin', admin.email, admin.password);
}
