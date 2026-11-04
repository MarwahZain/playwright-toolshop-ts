import { test, expect } from '../../../src/fixtures/pages';
import productData from '../../../test-data/products.json';

/**
 * Data-driven: one set of tests per product in test-data/products.json.
 * Product names are matched with substring text, so none of them may be a
 * substring of another product's name.
 */
for (const product of productData.products) {
  test.describe(`Product details: ${product.name}`, () => {
    test.beforeEach(async ({ homePage }) => {
      await homePage.open();
      await expect(homePage.productNames.first()).toBeVisible();
      await homePage.openProduct(product.name);
    });

    test(
      'shows the expected name and price',
      { tag: ['@smoke', '@regression'] },
      async ({ productPage }) => {
        await expect(productPage.name).toHaveText(product.name);
        expect(await productPage.getUnitPrice()).toBe(product.price);
      },
    );

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
