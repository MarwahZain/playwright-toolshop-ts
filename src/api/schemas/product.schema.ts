import { z } from 'zod';
import { BrandSummarySchema } from './brand.schema';
import { CategorySummarySchema } from './category.schema';
import { paginated } from './pagination.schema';

/** Sent: the body of POST /products and PUT /products/{id}. Related records are referenced by id. */
export const ProductRequestSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  price: z.number().positive(),
  category_id: z.string().min(1),
  brand_id: z.string().min(1),
  product_image_id: z.string().min(1),
  is_location_offer: z.boolean(),
  is_rental: z.boolean(),
  co2_rating: z.string().optional(),
  is_eco_friendly: z.boolean().optional(),
});
export type ProductRequest = z.infer<typeof ProductRequestSchema>;

/** The three ids in a product request that must point to existing records. */
export type ProductReferences = Pick<
  ProductRequest,
  'category_id' | 'brand_id' | 'product_image_id'
>;

/** Received: a product from GET /products and GET /products/{id}. Related records are nested. */
export const ProductResponseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  price: z.number().positive(),
  in_stock: z.boolean(),
  is_rental: z.boolean(),
  is_location_offer: z.boolean(),
  category: CategorySummarySchema,
  brand: BrandSummarySchema,
  product_image: z.object({ id: z.string().min(1) }),
});
export type ProductResponse = z.infer<typeof ProductResponseSchema>;

/** Received: GET /products, a paginated list of products. */
export const ProductListResponseSchema = paginated(ProductResponseSchema);

/**
 * Received: POST /products returns the stored record, which references category
 * and brand by id instead of nesting them, so only the shared fields are checked.
 */
export const ProductCreateResponseSchema = ProductResponseSchema.pick({
  id: true,
  name: true,
  price: true,
});
