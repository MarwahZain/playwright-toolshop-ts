import { test, expect } from '../../../src/fixtures/pages';
import productData from '../../../test-data/products.json';

/**
 * Data-driven: one set of tests per product in test-data/products.json.
 * Product names are matched with substring text, so none of them may be a
 * substring of another product's name.
 */
for (const [index, product] of productData.products.entries()) {
  // One product page is enough for the smoke set; every row runs in regression.
  const tags = index === 0 ? ['@smoke', '@regression'] : ['@regression'];

  test.describe(`Product details: ${product.name}`, () => {
    test.beforeEach(async ({ homePage }) => {
      await homePage.open();
      await expect(homePage.productNames.first()).toBeVisible();
      await homePage.openProduct(product.name);
    });

    // eslint-disable-next-line playwright/valid-test-tags -- tags are computed per dataset row (smoke for the first row only)
    test('shows the expected name and price', { tag: tags }, async ({ productPage }) => {
      await expect(productPage.name).toHaveText(product.name);
      expect(await productPage.getUnitPrice()).toBe(product.price);
    });

    test(
      'adding to cart updates the cart badge',
      { tag: '@regression' },
      async ({ productPage }) => {
        await productPage.addToCart();

        await expect(productPage.header.cartBadge.count).toHaveText('1');
      },
    );
  });
}
