import { test, expect } from '@playwright/test';
import { waitForProducts, getPrices, getNames } from '../../src/utils/products';

test.describe('Product sorting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('product-name').first()).toBeVisible();
  });

  test('sorts by price low to high', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    await waitForProducts(page, () => page.getByTestId('sort').selectOption('price,asc'));

    await expect(async () => {
      const prices = await getPrices(page);
      expect(prices.length).toBeGreaterThan(1);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    }).toPass();
  });

  test('sorts by price high to low', { tag: '@regression' }, async ({ page }) => {
    await waitForProducts(page, () => page.getByTestId('sort').selectOption('price,desc'));

    await expect(async () => {
      const prices = await getPrices(page);
      expect(prices.length).toBeGreaterThan(1);
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    }).toPass();
  });

  test('sorts by name A to Z', { tag: '@regression' }, async ({ page }) => {
    await waitForProducts(page, () => page.getByTestId('sort').selectOption('name,asc'));

    await expect(async () => {
      const names = await getNames(page);
      expect(names.length).toBeGreaterThan(1);
      expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    }).toPass();
  });

  test('sorts by name Z to A', { tag: '@regression' }, async ({ page }) => {
    await waitForProducts(page, () => page.getByTestId('sort').selectOption('name,desc'));

    await expect(async () => {
      const names = await getNames(page);
      expect(names.length).toBeGreaterThan(1);
      expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
    }).toPass();
  });
});