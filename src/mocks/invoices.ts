import { Page } from '@playwright/test';
import { MockUsage } from './products';

/**
 * Answers the order's invoice creation (POST /invoices) with a 422, the way the real
 * backend rejects an order it considers invalid. Every other request is untouched.
 */
export async function mockInvoiceCreationError(page: Page): Promise<MockUsage> {
  const usage: MockUsage = { calls: 0 };
  await page.route(
    (url) => url.pathname === '/invoices',
    async (route) => {
      if (route.request().method() !== 'POST') return route.fallback();
      usage.calls++;
      await route.fulfill({
        status: 422,
        json: { billing_country: ['The billing_country does not match the entered address.'] },
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    },
  );
  return usage;
}
