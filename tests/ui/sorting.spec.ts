import { test, expect } from '../../src/fixtures/pages';

test.describe('Product sorting', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
    await expect(homePage.productNames.first()).toBeVisible();
  });

  test('sorts by price low to high', { tag: ['@smoke', '@regression'] }, async ({ homePage }) => {
    await homePage.sortBy('price,asc');

    await expect(async () => {
      const prices = await homePage.getPrices();
      expect(prices.length).toBeGreaterThan(1);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    }).toPass();
  });

  test('sorts by price high to low', { tag: '@regression' }, async ({ homePage }) => {
    await homePage.sortBy('price,desc');

    await expect(async () => {
      const prices = await homePage.getPrices();
      expect(prices.length).toBeGreaterThan(1);
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    }).toPass();
  });

  test('sorts by name A to Z', { tag: '@regression' }, async ({ homePage }) => {
    await homePage.sortBy('name,asc');

    await expect(async () => {
      const names = await homePage.getNames();
      expect(names.length).toBeGreaterThan(1);
      expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    }).toPass();
  });

  test('sorts by name Z to A', { tag: '@regression' }, async ({ homePage }) => {
    await homePage.sortBy('name,desc');

    await expect(async () => {
      const names = await homePage.getNames();
      expect(names.length).toBeGreaterThan(1);
      expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
    }).toPass();
  });
});
