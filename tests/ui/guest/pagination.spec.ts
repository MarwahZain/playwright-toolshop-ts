import { test, expect } from '../../../src/fixtures/pages';

type PageMeta = { total: number; per_page: number; last_page: number; current_page: number };

test.describe('Pagination', () => {
  let meta: PageMeta;

  test.beforeEach(async ({ homePage }) => {
    const response = await homePage.openAndWaitForProducts();
    meta = await response.json();
    await expect(homePage.productNames.first()).toBeVisible();
  });

  test(
    'page 2 shows a different set of products than page 1',
    { tag: ['@smoke', '@regression'] },
    async ({ homePage }) => {
      const page1Names = await homePage.getNames();

      await homePage.goToPage('2');

      await expect(async () => {
        const page2Names = await homePage.getNames();
        expect(page2Names.length).toBeGreaterThan(0);
        const overlap = page2Names.filter((name) => page1Names.includes(name));
        expect(overlap).toEqual([]);
      }).toPass();
    },
  );

  test('highlights the current page', { tag: '@regression' }, async ({ homePage }) => {
    await expect(homePage.activePage).toHaveText('1');

    await homePage.goToPage('2');
    await expect(homePage.activePage).toHaveText('2');
  });

  test(
    'next and previous move one page at a time',
    { tag: '@regression' },
    async ({ homePage }) => {
      await homePage.goToNextPage();
      await expect(homePage.activePage).toHaveText('2');

      await homePage.goToPreviousPage();
      await expect(homePage.activePage).toHaveText('1');
    },
  );

  test('last page shows the remaining products', { tag: '@regression' }, async ({ homePage }) => {
    expect(meta.last_page).toBeGreaterThan(1);

    await homePage.goToPage(String(meta.last_page));

    const expectedOnLastPage = meta.total - meta.per_page * (meta.last_page - 1);
    await expect(homePage.productNames).toHaveCount(expectedOnLastPage);
  });
});
