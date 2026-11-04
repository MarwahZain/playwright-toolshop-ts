import { test, expect } from '../../../src/fixtures/pages';
import searchData from '../../../test-data/search.json';

test.describe('Product search', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test(
    'returns only products matching the search term',
    { tag: ['@smoke', '@regression'] },
    async ({ homePage }) => {
      await homePage.searchFor(searchData.matchingTerm);

      await expect(homePage.productNames).not.toHaveCount(0);
      // No product on the page may be missing the term (retries until the grid settles)
      await expect(homePage.productNames.filter({ hasNotText: /pliers/i })).toHaveCount(0);
    },
  );

  test('search is case-insensitive', { tag: '@regression' }, async ({ homePage }) => {
    await homePage.searchFor(searchData.caseInsensitiveTerm);

    await expect(homePage.productNames).not.toHaveCount(0);
    await expect(homePage.productNames.filter({ hasNotText: /hammer/i })).toHaveCount(0);
  });

  test('shows a message when nothing matches', { tag: '@regression' }, async ({ homePage }) => {
    await homePage.searchFor(searchData.noMatchTerm);

    await expect(homePage.productNames).toHaveCount(0);
    await expect(homePage.noResults).toBeVisible();
  });
});
