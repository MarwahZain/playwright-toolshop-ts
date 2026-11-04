import { test, expect } from '../../src/fixtures/pages';

test.describe('Smoke', () => {
  test('home page loads and shows products', { tag: '@smoke' }, async ({ page, homePage }) => {
    await homePage.openAndWaitForProducts();

    await expect(page).toHaveTitle(/Practice Software Testing/);
    await expect(homePage.searchInput).toBeVisible();
    await expect(homePage.productNames).not.toHaveCount(0);
  });
});
