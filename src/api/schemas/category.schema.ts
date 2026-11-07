import { z } from 'zod';

/** Sent: the body of POST /categories and PUT /categories/{id}. */
export const CategoryRequestSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  parent_id: z.string().optional(),
});
export type CategoryRequest = z.infer<typeof CategoryRequestSchema>;

/** Received: a category from the categories endpoints. */
export const CategoryResponseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  parent_id: z.string().nullable().optional(),
});
export type CategoryResponse = z.infer<typeof CategoryResponseSchema>;

/** Received: GET /categories/tree, top-level categories with their children. */
export const CategoryTreeResponseSchema = z.array(
  CategoryResponseSchema.extend({
    sub_categories: z.array(CategoryResponseSchema).optional(),
  }),
);

/** Received: the short form of a category, nested inside a product response. */
export const CategorySummarySchema = CategoryResponseSchema.pick({
  id: true,
  name: true,
  slug: true,
});
