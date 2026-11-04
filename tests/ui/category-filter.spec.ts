import { test, expect } from '../../src/fixtures/pages';

test.describe('Category filter', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
    await expect(homePage.productNames.first()).toBeVisible();
  });

  test(
    'shows only products from the selected category',
    { tag: ['@smoke', '@regression'] },
    async ({ homePage }) => {
      await homePage.toggleCategory('Hammer');

      await expect(homePage.productNames).not.toHaveCount(0);
      await expect(homePage.productNames.filter({ hasNotText: /hammer/i })).toHaveCount(0);
    },
  );

  test(
    'UI shows exactly the products the API returned',
    { tag: '@regression' },
    async ({ homePage }) => {
      const response = await homePage.toggleCategory('Pliers');
      const body = await response.json();
      const apiNames: string[] = body.data.map((p: { name: string }) => p.name);

      expect(apiNames.length).toBeGreaterThan(0);
      await expect(homePage.productNames).toHaveText(apiNames);
    },
  );

  test(
    'selecting two categories combines their products',
    { tag: '@regression' },
    async ({ homePage }) => {
      await homePage.toggleCategory('Hammer');
      await expect(homePage.productNames.filter({ hasNotText: /hammer/i })).toHaveCount(0);
      const hammerCount = await homePage.productNames.count();

      await homePage.toggleCategory('Pliers');
      await expect(homePage.productNames.filter({ hasText: /pliers/i })).not.toHaveCount(0);
      await expect(homePage.productNames.filter({ hasText: /hammer/i })).not.toHaveCount(0);
      expect(await homePage.productNames.count()).toBeGreaterThan(hammerCount);
    },
  );

  test(
    'unchecking the category restores the full list',
    { tag: '@regression' },
    async ({ homePage }) => {
      const initialNames = await homePage.productNames.allTextContents();

      await homePage.toggleCategory('Hammer');
      await expect(homePage.productNames.filter({ hasNotText: /hammer/i })).toHaveCount(0);

      await homePage.toggleCategory('Hammer');
      await expect(homePage.productNames).toHaveText(initialNames.map((n) => n.trim()));
    },
  );
});
