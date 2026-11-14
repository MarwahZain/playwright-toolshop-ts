import { test, expect } from '../../src/fixtures/api';
import { existingReferences, newProduct } from '../../src/api/builders';
import {
  BrandResponseSchema,
  ProductCreateResponseSchema,
  ProductListResponseSchema,
  ProductResponseSchema,
} from '../../src/api/schemas';
import { expectSchema } from '../../src/utils/schema';
import { uniqueSuffix } from '../../src/utils/unique';

/**
 * Known bug: with a token, the API returns in_stock as a number (1 or 0), and as null for a
 * newly created product. Anonymous requests get a boolean. The contract says boolean, so these
 * tests keep expecting one and are reported as expected failures until the bug is fixed.
 */
const IN_STOCK_ISSUE =
  'Known bug: in_stock is a number or null instead of a boolean for authenticated requests (issue #TBD)';

test.describe('Products API: read', () => {
  test(
    'lists products with paging metadata',
    // Not @smoke while the in_stock known bug makes it an expected failure; add @smoke back once fixed.
    { tag: ['@api', '@regression'] },
    async ({ productsApi }) => {
      test.fail(true, IN_STOCK_ISSUE);

      const response = await productsApi.list();

      expect(response.status()).toBe(200);
      const body = expectSchema(ProductListResponseSchema, await response.json());
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.data.length).toBeLessThanOrEqual(body.per_page);
      expect(body.last_page).toBe(Math.ceil(body.total / body.per_page));
    },
  );

  test(
    'returns a single product by id',
    { tag: ['@api', '@regression'] },
    async ({ productsApi }) => {
      test.fail(true, IN_STOCK_ISSUE);

      const list = expectSchema(ProductListResponseSchema, await (await productsApi.list()).json());
      const first = list.data[0];

      const response = await productsApi.get(first.id);

      expect(response.status()).toBe(200);
      const product = expectSchema(ProductResponseSchema, await response.json());
      expect(product.id).toBe(first.id);
      expect(product.name).toBe(first.name);
      expect(product.price).toBe(first.price);
    },
  );

  test(
    'filters products by category',
    { tag: ['@api', '@regression'] },
    async ({ productsApi }) => {
      test.fail(true, IN_STOCK_ISSUE);

      const { category_id } = await existingReferences(productsApi);

      const body = expectSchema(
        ProductListResponseSchema,
        await (await productsApi.list({ by_category: category_id })).json(),
      );

      expect(body.data.length).toBeGreaterThan(0);
      for (const product of body.data) {
        expect(product.category.id).toBe(category_id);
      }
    },
  );
});

test.describe('Products API: write', () => {
  test(
    'creates, reads, updates and deletes a product',
    { tag: ['@api', '@regression'] },
    async ({ productsApi }) => {
      test.fail(true, IN_STOCK_ISSUE);

      const refs = await existingReferences(productsApi);
      const payload = newProduct(refs);

      const created = await productsApi.create(payload);
      expect(created.status()).toBe(201);
      const product = expectSchema(ProductCreateResponseSchema, await created.json());
      expect(product.name).toBe(payload.name);
      expect(product.price).toBe(payload.price);

      try {
        const fetched = expectSchema(
          ProductResponseSchema,
          await (await productsApi.get(product.id)).json(),
        );
        expect(fetched.name).toBe(payload.name);
        expect(fetched.category.id).toBe(refs.category_id);
        expect(fetched.brand.id).toBe(refs.brand_id);

        const updated = await productsApi.update(product.id, { ...payload, price: 24.5 });
        expect(updated.status()).toBe(200);

        const afterUpdate = expectSchema(
          ProductResponseSchema,
          await (await productsApi.get(product.id)).json(),
        );
        expect(afterUpdate.price).toBe(24.5);
        expect(afterUpdate.name).toBe(payload.name);
      } finally {
        expect((await productsApi.delete(product.id)).status()).toBe(204);
      }

      expect((await productsApi.get(product.id)).status()).toBe(404);
    },
  );

  test(
    'does not delete a brand that a product still uses',
    { tag: ['@api', '@regression'] },
    async ({ productsApi, brandsApi }) => {
      const id = uniqueSuffix();
      const brand = expectSchema(
        BrandResponseSchema,
        await (
          await brandsApi.create({ name: `QA In-use Brand ${id}`, slug: `qa-in-use-brand-${id}` })
        ).json(),
      );
      const refs = await existingReferences(productsApi);
      const product = expectSchema(
        ProductCreateResponseSchema,
        await (await productsApi.create(newProduct({ ...refs, brand_id: brand.id }))).json(),
      );

      try {
        const response = await brandsApi.delete(brand.id);
        expect(response.status(), 'deleting a brand in use should be refused').not.toBe(204);
        expect((await brandsApi.get(brand.id)).status()).toBe(200);
      } finally {
        await productsApi.delete(product.id);
        await brandsApi.delete(brand.id);
      }
    },
  );
});
