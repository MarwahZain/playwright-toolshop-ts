import { z } from 'zod';

/** Received: POST /carts, the new cart's id. */
export const CartCreateResponseSchema = z.object({
  id: z.string().min(1),
});
export type CartCreateResponse = z.infer<typeof CartCreateResponseSchema>;

/** Sent: the body of POST /carts/{id}, adding a product to the cart. */
export const CartItemRequestSchema = z.object({
  product_id: z.string().min(1),
  quantity: z.number().int().positive(),
});
export type CartItemRequest = z.infer<typeof CartItemRequestSchema>;
