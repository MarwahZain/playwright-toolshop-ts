import { test, expect } from '../../src/fixtures/pages';
import { delayProductList, mockProductListError } from '../../src/mocks/products';

/**
 * How the shop behaves when the backend misbehaves. These states cannot be
 * produced with real data, so the product list request is mocked.
 */
test.describe('Product list when the backend misbehaves (mocked)', () => {
  test(
    'a 500 server error shows a message instead of an empty page',
    { tag: ['@mocked', '@regression'] },
    async ({ page, homePage }) => {
      test.fail(
        true,
        'Known bug: after a 500, the product grid shows loading placeholders forever and no error message (issue #TBD)',
      );

      const mock = await mockProductListError(page, 500);

      // openAndWaitForProducts() waits for a successful response, which never comes here.
      await homePage.open();

      await expect
        .poll(() => mock.calls, {
          message: 'the product list request should be answered by the mock',
        })
        .toBeGreaterThan(0);
      await expect(homePage.productNames).toHaveCount(0);
      await expect(
        homePage.loadingIndicator,
        'the page should stop showing a loading state',
      ).toBeHidden();
      await expect(
        homePage.errorAlert,
        'the user should be told that loading products failed',
      ).toBeVisible();
    },
  );

  test(
    'a slow response shows products once they arrive',
    { tag: ['@mocked', '@regression'] },
    async ({ page, homePage }) => {
      const mock = await delayProductList(page, 3000);

      await homePage.open();

      // While the answer is held back: nothing rendered yet, ideally a loading indicator.
      await expect
        .poll(() => mock.calls, { message: 'the product list request should go through the mock' })
        .toBeGreaterThan(0);
      await expect(homePage.productNames).toHaveCount(0);
      await expect
        .soft(homePage.loadingIndicator, 'the user should see that products are loading')
        .toBeVisible();

      // Once the real answer is released: products appear, the indicator is gone.
      await expect(homePage.productNames.first()).toBeVisible({ timeout: 10_000 });
      await expect(homePage.loadingIndicator).toBeHidden();
    },
  );
});
