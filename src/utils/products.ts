import { Page, Response } from '@playwright/test';
import { parsePrice } from './price';

/** Runs an action and waits for the product list API call it triggers. */
export async function waitForProducts(page: Page, action: () => Promise<unknown>,): Promise<Response> {
  const response = page.waitForResponse(
    (res) => new URL(res.url()).pathname === '/products' && res.ok(),
  );
  await action();
  return response;
}

/** Reads all visible product prices as numbers, e.g. "$14.15" -> 14.15 */
export async function getPrices(page: Page): Promise<number[]> {
  const texts = await page.getByTestId('product-price').allTextContents();
  return texts.map(parsePrice);
}

export async function getNames(page: Page): Promise<string[]> {
  const texts = await page.getByTestId('product-name').allTextContents();
  return texts.map((t) => t.trim());
}