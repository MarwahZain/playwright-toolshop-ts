import { test, expect } from '@playwright/test';


test.describe('Smoke', () => {
  test('home page loads and shows products', { tag: '@smoke' }, async ({ page }) => {
    await page.goto('/');

    // Page loaded
    await expect(page).toHaveTitle(/Practice Software Testing/);
    await expect(page.getByTestId('search-query')).toBeVisible();

    // Products rendered (they load from the API after the page opens)
    const productNames = page.getByTestId('product-name');
    await expect(productNames.first()).toBeVisible();
    expect(await productNames.count()).toBeGreaterThan(0);
  });
});