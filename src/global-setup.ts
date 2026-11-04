import { request } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

export const AUTH_FILE = path.join('.auth', 'customer.json');

/**
 * Logs in once before the suite via POST /users/login and stores the
 * returned access token so specs can reuse it without logging in again.
 */
export default async function globalSetup(): Promise<void> {
  const apiURL = process.env.API_URL;
  const email = process.env.CUSTOMER_EMAIL;
  const password = process.env.CUSTOMER_PASSWORD;

  if (!apiURL || !email || !password) {
    throw new Error(
      'global-setup: API_URL, CUSTOMER_EMAIL and CUSTOMER_PASSWORD must be set in .env.',
    );
  }

  const api = await request.newContext({ baseURL: apiURL });
  try {
    const response = await api.post('/users/login', {
      headers: { Accept: 'application/json' },
      data: { email, password },
    });

    if (!response.ok()) {
      throw new Error(
        `global-setup: POST /users/login failed with ${response.status()} ${response.statusText()}`,
      );
    }

    const body = (await response.json()) as {
      access_token?: string;
      token_type?: string;
      expires_in?: number;
    };
    if (!body.access_token) {
      throw new Error('global-setup: POST /users/login response has no access_token.');
    }

    await fs.mkdir(path.dirname(AUTH_FILE), { recursive: true });
    await fs.writeFile(
      AUTH_FILE,
      JSON.stringify(
        {
          accessToken: body.access_token,
          tokenType: body.token_type ?? 'bearer',
          expiresIn: body.expires_in ?? null,
          savedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
    );
  } finally {
    await api.dispose();
  }
}
