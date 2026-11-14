import { Page, Route } from '@playwright/test';
import { z } from 'zod';
import { ProductListResponseSchema, ProductResponse } from '../api/schemas';

type ProductListResponse = z.infer<typeof ProductListResponseSchema>;

/** Matches per_page from the real GET /products, so mocked paging looks like the backend's. */
export const API_PAGE_SIZE = 9;

/** How often a mock answered, so a test can prove the mock was actually used. */
export type MockUsage = { calls: number };

/** The shop's product list request, whether sent as GET or QUERY. */
const isProductList = (url: URL) => url.pathname === '/products';

/** The browser's CORS preflight goes to the real API; only the data request is mocked. */
const isPreflight = (route: Route) => route.request().method() === 'OPTIONS';

/** The API runs on another port than the shop, so a mocked answer needs a CORS header. */
const CORS = { 'Access-Control-Allow-Origin': '*' };

/**
 * Answers the product list request with the given products, without reaching the backend.
 * The body is typed with the real contract, so a mock can never return a shape the API would not.
 */
export async function mockProductList(
  page: Page,
  products: ProductResponse[],
  { perPage = API_PAGE_SIZE }: { perPage?: number } = {},
): Promise<MockUsage> {
  const usage: MockUsage = { calls: 0 };
  const body: ProductListResponse = {
    current_page: 1,
    per_page: perPage,
    last_page: Math.max(1, Math.ceil(products.length / perPage)),
    total: products.length,
    data: products.slice(0, perPage),
  };

  await page.route(isProductList, async (route) => {
    if (isPreflight(route)) return route.fallback();
    usage.calls++;
    await route.fulfill({ status: 200, json: body, headers: CORS });
  });
  return usage;
}

/** Answers the product list request with a server error. */
export async function mockProductListError(page: Page, status = 500): Promise<MockUsage> {
  const usage: MockUsage = { calls: 0 };
  await page.route(isProductList, async (route) => {
    if (isPreflight(route)) return route.fallback();
    usage.calls++;
    await route.fulfill({ status, json: { message: 'Server Error' }, headers: CORS });
  });
  return usage;
}

/**
 * Lets the product list request reach the real API, but holds the answer back.
 * The data is real; only the timing is changed.
 */
export async function delayProductList(page: Page, delayMs: number): Promise<MockUsage> {
  const usage: MockUsage = { calls: 0 };
  await page.route(isProductList, async (route) => {
    if (isPreflight(route)) return route.fallback();
    usage.calls++;
    const response = await route.fetch();
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    await route.fulfill({ response });
  });
  return usage;
}
