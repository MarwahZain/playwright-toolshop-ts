import { z } from 'zod';
import { test as base, expect } from '../../src/fixtures/hybrid';
import { existingReferences, newProduct } from '../../src/api/builders';
import {
  BrandResponse,
  BrandResponseSchema,
  ProductCreateResponseSchema,
  ProductResponseSchema,
} from '../../src/api/schemas';
import { expectSchema } from '../../src/utils/schema';
import { uniqueSuffix } from '../../src/utils/unique';

/**
 * Arrange through the API as admin, assert in the shop as a signed-out shopper.
 * Each test gets its own brand and product with unique names, so tests can run
 * in parallel and never match seed data.
 */
/**
 * The fields the UI assertions use. The full product contract is checked by the
 * API contract tests; this test is about what the shop shows.
 */
const ShopProductSchema = ProductResponseSchema.pick({
  id: true,
  name: true,
  price: true,
  category: true,
});
type ShopProduct = z.infer<typeof ShopProductSchema>;

type ShopData = { brand: BrandResponse; product: ShopProduct };

/**
 * Arranges the data through the API as admin, hands it to the test, then deletes it.
 * The cleanup runs even when the test fails, and only for what was actually created.
 */
const test = base.extend<{ shopData: ShopData }>({
  shopData: async ({ brandsApi, productsApi }, use) => {
    const id = uniqueSuffix();
    const brand = expectSchema(
      BrandResponseSchema,
      await (await brandsApi.create({ name: `QA Brand ${id}`, slug: `qa-brand-${id}` })).json(),
    );
    try {
      const refs = await existingReferences(productsApi);
      const created = expectSchema(
        ProductCreateResponseSchema,
        await (await productsApi.create(newProduct({ ...refs, brand_id: brand.id }))).json(),
      );
      try {
        // Read it back to get the category name the product page shows.
        const product = expectSchema(
          ShopProductSchema,
          await (await productsApi.get(created.id)).json(),
        );
        await use({ brand, product });
      } finally {
        // Product first: a brand cannot be deleted while a product still uses it.
        await productsApi.delete(created.id);
      }
    } finally {
      await brandsApi.delete(brand.id);
    }
  },
});

test.describe('Admin-created product in the shop', () => {
  test(
    'appears in search with its name and price',
    { tag: '@hybrid' },
    async ({ homePage, shopData: { product } }) => {
      await homePage.openAndWaitForProducts();
      await homePage.searchFor(product.name);

      // The name is unique, so the search must return exactly this one product.
      await expect(homePage.productNames).toHaveText([product.name]);
      await expect(homePage.card(product.name).price).toContainText(product.price.toFixed(2));
    },
  );

  test(
    'shows its name, price, brand and category on the product page',
    { tag: '@hybrid' },
    async ({ homePage, productPage, shopData: { brand, product } }) => {
      await homePage.openAndWaitForProducts();
      await homePage.searchFor(product.name);
      await homePage.openProduct(product.name);

      await expect(productPage.name).toHaveText(product.name);
      await expect(productPage.unitPrice).toContainText(product.price.toFixed(2));
      await expect(productPage.brand).toHaveText(brand.name);
      await expect(productPage.category).toHaveText(product.category.name);
    },
  );

  test(
    'is listed under its brand in the brand filter',
    { tag: '@hybrid' },
    async ({ homePage, shopData: { brand, product } }) => {
      await homePage.openAndWaitForProducts();
      await homePage.toggleBrand(brand.name);

      // The brand is new, so this product must be the only one listed under it.
      await expect(homePage.productNames).toHaveText([product.name]);
    },
  );
});
