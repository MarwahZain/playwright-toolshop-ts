import { test, expect, Page } from '@playwright/test';
import { waitForProducts, getNames } from '../../src/utils/products';

type PageMeta = { total: number; per_page: number; last_page: number; current_page: number };

const pagination = (page: Page) => page.locator('ul.pagination');
const pageButton = (page: Page, label: string) =>
  pagination(page).getByText(label, { exact: true });

test.describe('Pagination', () => {
  let meta: PageMeta;

  test.beforeEach(async ({ page }) => {
    const response = await waitForProducts(page, () => page.goto('/'));
    meta = await response.json();
    await expect(page.getByTestId('product-name').first()).toBeVisible();
  });

  test('page 2 shows a different set of products than page 1', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    const page1Names = await getNames(page);

    await waitForProducts(page, () => pageButton(page, '2').click());

    await expect(async () => {
      const page2Names = await getNames(page);
      expect(page2Names.length).toBeGreaterThan(0);
      const overlap = page2Names.filter((name) => page1Names.includes(name));
      expect(overlap).toEqual([]);
    }).toPass();
  });

  test('highlights the current page', { tag: '@regression' }, async ({ page }) => {
    const active = pagination(page).locator('.active');
    await expect(active).toHaveText('1');

    await waitForProducts(page, () => pageButton(page, '2').click());
    await expect(active).toHaveText('2');
  });

  test('next and previous move one page at a time', { tag: '@regression' }, async ({ page }) => {
    const active = pagination(page).locator('.active');

    await waitForProducts(page, () => pagination(page).getByLabel('Next').click());
    await expect(active).toHaveText('2');

    await waitForProducts(page, () => pagination(page).getByLabel('Previous').click());
    await expect(active).toHaveText('1');
  });

  test('last page shows the remaining products', { tag: '@regression' }, async ({ page }) => {
    expect(meta.last_page).toBeGreaterThan(1);

    await waitForProducts(page, () => pageButton(page, String(meta.last_page)).click());

    const expectedOnLastPage = meta.total - meta.per_page * (meta.last_page - 1);
    await expect(page.getByTestId('product-name')).toHaveCount(expectedOnLastPage);
  });
});