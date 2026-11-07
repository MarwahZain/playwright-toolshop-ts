import { test, expect } from '../../src/fixtures/api';
import { CategoryResponseSchema, CategoryTreeResponseSchema } from '../../src/api/schemas';
import { expectSchema } from '../../src/utils/schema';
import { uniqueSuffix } from '../../src/utils/unique';

test.describe('Categories API', () => {
  test(
    'creates, reads, updates and deletes a category',
    { tag: '@api' },
    async ({ categoriesApi }) => {
      const id = uniqueSuffix();
      const created = await categoriesApi.create({
        name: `QA Category ${id}`,
        slug: `qa-category-${id}`,
      });
      expect(created.status()).toBe(201);
      const category = expectSchema(CategoryResponseSchema, await created.json());
      expect(category.name).toBe(`QA Category ${id}`);

      try {
        const fetched = await categoriesApi.get(category.id);
        expect(fetched.status()).toBe(200);
        expect(expectSchema(CategoryResponseSchema, await fetched.json()).slug).toBe(
          `qa-category-${id}`,
        );

        const updated = await categoriesApi.update(category.id, {
          name: `QA Category ${id} updated`,
          slug: `qa-category-${id}-updated`,
        });
        expect(updated.status()).toBe(200);

        const afterUpdate = expectSchema(
          CategoryResponseSchema,
          await (await categoriesApi.get(category.id)).json(),
        );
        expect(afterUpdate.name).toBe(`QA Category ${id} updated`);
        expect(afterUpdate.slug).toBe(`qa-category-${id}-updated`);
      } finally {
        expect((await categoriesApi.delete(category.id)).status()).toBe(204);
      }

      expect((await categoriesApi.get(category.id)).status()).toBe(404);
    },
  );

  test(
    'places a child category under its parent in the tree',
    { tag: '@api' },
    async ({ categoriesApi }) => {
      const tree = expectSchema(
        CategoryTreeResponseSchema,
        await (await categoriesApi.tree()).json(),
      );
      const parent = tree[0];

      const id = uniqueSuffix();
      const created = await categoriesApi.create({
        name: `QA Child ${id}`,
        slug: `qa-child-${id}`,
        parent_id: parent.id,
      });
      expect(created.status()).toBe(201);
      const child = expectSchema(CategoryResponseSchema, await created.json());

      try {
        const treeAfter = expectSchema(
          CategoryTreeResponseSchema,
          await (await categoriesApi.tree()).json(),
        );
        const parentAfter = treeAfter.find((node) => node.id === parent.id);
        const childIds = (parentAfter?.sub_categories ?? []).map((node) => node.id);
        expect(childIds).toContain(child.id);
      } finally {
        await categoriesApi.delete(child.id);
      }
    },
  );
});
