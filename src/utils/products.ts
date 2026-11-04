import { Page, Response } from '@playwright/test';

/** Runs an action and waits for the product list API call it triggers. */
export async function waitForProducts(
  page: Page,
  action: () => Promise<unknown>,
): Promise<Response> {
  const response = page.waitForResponse(
    (res) => new URL(res.url()).pathname === '/products' && res.ok(),
  );
  await action();
  return response;
}
