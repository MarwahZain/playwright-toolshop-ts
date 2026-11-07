import { z } from 'zod';

/** Sent: the body of POST /brands and PUT /brands/{id}. */
export const BrandRequestSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
});
export type BrandRequest = z.infer<typeof BrandRequestSchema>;

/** Received: a brand from GET /brands, GET /brands/{id} and POST /brands. */
export const BrandResponseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
});
export type BrandResponse = z.infer<typeof BrandResponseSchema>;

/** Received: the short form of a brand, nested inside a product response. */
export const BrandSummarySchema = BrandResponseSchema.pick({ id: true, name: true });
