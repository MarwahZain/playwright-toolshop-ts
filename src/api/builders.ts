import { z } from 'zod';
import { ProductsApi } from './ProductsApi';
import { BrandRequest, CategoryRequest, ProductReferences, ProductRequest } from './schemas';
import { uniqueSuffix } from '../utils/unique';

/** A well-formed ID that no record has, for 404 tests. */
export const UNKNOWN_ID = '01AAAAAAAAAAAAAAAAAAAAAAAA';

/**
 * Only the fields existingReferences reads. Setup helpers deliberately check no more
 * than they use: the full contract is checked by the contract tests, so one contract
 * problem fails those tests only, instead of every test that needs a product.
 */
const ReferenceSourceSchema = z.object({
  data: z
    .array(
      z.object({
        category: z.object({ id: z.string().min(1) }),
        brand: z.object({ id: z.string().min(1) }),
        product_image: z.object({ id: z.string().min(1) }),
      }),
    )
    .min(1),
});

/** IDs a new product needs, taken from an existing product so they are always valid. */
export async function existingReferences(productsApi: ProductsApi): Promise<ProductReferences> {
  const list = ReferenceSourceSchema.parse(await (await productsApi.list()).json());
  const sample = list.data[0];
  return {
    category_id: sample.category.id,
    brand_id: sample.brand.id,
    product_image_id: sample.product_image.id,
  };
}

export function newBrand(): BrandRequest {
  const id = uniqueSuffix();
  return { name: `QA Brand ${id}`, slug: `qa-brand-${id}` };
}

export function newCategory(): CategoryRequest {
  const id = uniqueSuffix();
  return { name: `QA Category ${id}`, slug: `qa-category-${id}` };
}

export function newProduct(refs: ProductReferences): ProductRequest {
  return {
    name: `QA Product ${uniqueSuffix()}`,
    description: 'Created by an automated API test.',
    price: 19.99,
    is_location_offer: false,
    is_rental: false,
    co2_rating: 'B',
    is_eco_friendly: false,
    ...refs,
  };
}
