import { Page } from '@playwright/test';

/**
 * Makes the shop in this page use a cart created through the API.
 * The app keeps its cart id and the badge count in sessionStorage, which
 * Playwright's storageState files do not hold, so they are written before
 * the app's own scripts run, on every page load.
 */
export async function useCartInBrowser(
  page: Page,
  cartId: string,
  itemCount: number,
): Promise<void> {
  await page.addInitScript(
    ({ id, count }) => {
      window.sessionStorage.setItem('cart_id', id);
      window.sessionStorage.setItem('cart_quantity', String(count));
    },
    { id: cartId, count: itemCount },
  );
}
