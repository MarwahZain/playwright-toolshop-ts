import { test, expect } from '../../src/fixtures/api';
import { BrandResponseSchema } from '../../src/api/schemas';
import { expectSchema } from '../../src/utils/schema';
import { uniqueSuffix } from '../../src/utils/unique';

test.describe('Brands API', () => {
  test(
    'creates, reads, updates and deletes a brand',
    { tag: ['@api', '@regression'] },
    async ({ brandsApi }) => {
      const suffix = uniqueSuffix();
      const created = await brandsApi.create({
        name: `QA Brand ${suffix}`,
        slug: `qa-brand-${suffix}`,
      });
      expect(created.status()).toBe(201);
      const brand = expectSchema(BrandResponseSchema, await created.json());

      try {
        const fetched = await brandsApi.get(brand.id);
        expect(fetched.status()).toBe(200);
        expect(expectSchema(BrandResponseSchema, await fetched.json()).name).toBe(
          `QA Brand ${suffix}`,
        );

        const updated = await brandsApi.update(brand.id, {
          name: `QA Brand ${suffix} updated`,
          slug: `qa-brand-${suffix}-updated`,
        });
        expect(updated.status()).toBe(200);
        expect(
          expectSchema(BrandResponseSchema, await (await brandsApi.get(brand.id)).json()).name,
        ).toBe(`QA Brand ${suffix} updated`);
      } finally {
        // Clean up even if an assertion above failed, so no test data is left behind.
        const deleted = await brandsApi.delete(brand.id);
        expect(deleted.status()).toBe(204);
      }

      expect((await brandsApi.get(brand.id)).status()).toBe(404);
    },
  );
});
