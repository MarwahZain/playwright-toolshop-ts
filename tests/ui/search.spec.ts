import { test, expect, Page } from '@playwright/test';

async function searchFor(page: Page, term: string) {
  const searchResponse = page.waitForResponse(
    (res) => res.url().includes('/products/search') && res.ok(),
  );
  await page.getByTestId('search-query').fill(term);
  await page.getByTestId('search-submit').click();
  await searchResponse;
}

test.describe('Product search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('returns only products matching the search term', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    await searchFor(page, 'Pliers');

    const productNames = page.getByTestId('product-name');
    await expect(productNames).not.toHaveCount(0);
    // No product on the page may be missing the term (retries until the grid settles)
    await expect(productNames.filter({ hasNotText: /pliers/i })).toHaveCount(0);
  });

  test('search is case-insensitive', { tag: '@regression' }, async ({ page }) => {
    await searchFor(page, 'hammer');

    const productNames = page.getByTestId('product-name');
    await expect(productNames).not.toHaveCount(0);
    await expect(productNames.filter({ hasNotText: /hammer/i })).toHaveCount(0);
  });

  test('shows a message when nothing matches', { tag: '@regression' }, async ({ page }) => {
    await searchFor(page, 'NonExistingProduct123');

    await expect(page.getByTestId('product-name')).toHaveCount(0);
    await expect(page.getByTestId('no-results')).toBeVisible();
  });
});