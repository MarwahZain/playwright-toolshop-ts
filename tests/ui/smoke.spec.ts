import { test, expect } from '../../src/fixtures/pages';

test.describe('Smoke', () => {
  test('home page loads and shows products', { tag: '@smoke' }, async ({ homePage }) => {
    await homePage.openAndWaitForProducts();

    await homePage.expectTitle(/Practice Software Testing/);
    await expect(homePage.searchInput).toBeVisible();
    await expect(homePage.productNames).not.toHaveCount(0);
  });
});
