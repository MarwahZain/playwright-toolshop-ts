import { Page } from '@playwright/test';
import { z } from 'zod';
import { ProductListResponseSchema, ProductResponse } from '../api/schemas';

type ProductListResponse = z.infer<typeof ProductListResponseSchema>;

/**
 * Answers the shop's product list request (GET or QUERY /products) with the given products,
 * without reaching the backend. The mocked body is typed with the real contract, so a mock
 * can never return a shape the real API would not.
 *
 * Returns a counter, so a test can prove the mock was actually used.
 */
export async function mockProductList(
  page: Page,
  products: ProductResponse[],
): Promise<{ calls: number }> {
  const usage = { calls: 0 };
  const perPage = 9;
  const body: ProductListResponse = {
    current_page: 1,
    per_page: perPage,
    last_page: Math.max(1, Math.ceil(products.length / perPage)),
    total: products.length,
    data: products.slice(0, perPage),
  };

  await page.route(
    (url) => url.pathname === '/products',
    async (route) => {
      // The browser's CORS preflight is answered by the real API; only the data request is mocked.
      if (route.request().method() === 'OPTIONS') return route.fallback();
      usage.calls++;
      await route.fulfill({
        status: 200,
        json: body,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    },
  );

  return usage;
}
