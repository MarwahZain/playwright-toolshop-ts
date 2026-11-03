import { test, expect, Page } from '@playwright/test';

async function toggleCategory(page: Page, category: string) {
  const filterResponse = page.waitForResponse(
    (res) =>
      new URL(res.url()).pathname === '/products' &&
      res.request().method() === 'QUERY' &&
      res.ok(),
  );
  await page.getByLabel(category, { exact: true }).click();
  return filterResponse;
}

test.describe('Category filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('product-name').first()).toBeVisible();
  });

  test('shows only products from the selected category', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    await toggleCategory(page, 'Hammer');

    const productNames = page.getByTestId('product-name');
    await expect(productNames).not.toHaveCount(0);
    await expect(productNames.filter({ hasNotText: /hammer/i })).toHaveCount(0);
  });

  test('UI shows exactly the products the API returned', { tag: '@regression' }, async ({ page }) => {
    const response = await toggleCategory(page, 'Pliers');
    const body = await response.json();
    const apiNames: string[] = body.data.map((p: { name: string }) => p.name);

    expect(apiNames.length).toBeGreaterThan(0);
    await expect(page.getByTestId('product-name')).toHaveText(apiNames);
  });

  test('selecting two categories combines their products', { tag: '@regression' }, async ({ page }) => {
    await toggleCategory(page, 'Hammer');
    const productNames = page.getByTestId('product-name');
    await expect(productNames.filter({ hasNotText: /hammer/i })).toHaveCount(0);
    const hammerCount = await productNames.count();

    await toggleCategory(page, 'Pliers');
    await expect(productNames.filter({ hasText: /pliers/i })).not.toHaveCount(0);
    await expect(productNames.filter({ hasText: /hammer/i })).not.toHaveCount(0);
    expect(await productNames.count()).toBeGreaterThan(hammerCount);
  });

  test('unchecking the category restores the full list', { tag: '@regression' }, async ({ page }) => {
    const productNames = page.getByTestId('product-name');
    const initialNames = await productNames.allTextContents();

    await toggleCategory(page, 'Hammer');
    await expect(productNames.filter({ hasNotText: /hammer/i })).toHaveCount(0);

    await page.getByLabel('Hammer', { exact: true }).click();
    await expect(productNames).toHaveText(initialNames.map((n) => n.trim()));
  });
});