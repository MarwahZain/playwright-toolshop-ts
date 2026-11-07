import { test, expect } from '../../src/fixtures/pages';
import { mockProductList } from '../../src/mocks/products';

/**
 * The backend always has products, so an empty shop can only be tested by mocking.
 * The product list request is answered with an empty list before the page loads.
 */
test.describe('Empty product list (mocked)', () => {
  test(
    'shows a message instead of an empty grid',
    { tag: ['@mocked', '@regression'] },
    async ({ page, homePage }) => {
      const mock = await mockProductList(page, []);

      await homePage.openAndWaitForProducts();

      // Prove the page really received the mocked answer, not real data.
      expect(mock.calls, 'the product list request should be answered by the mock').toBeGreaterThan(
        0,
      );

      await expect(homePage.productNames).toHaveCount(0);
      await expect(homePage.noResults).toBeVisible();
      await expect(homePage.pagination).toBeHidden();
    },
  );
});
