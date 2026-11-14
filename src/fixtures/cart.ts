import { z } from 'zod';
import { test as hybridTest, expect } from './hybrid';
import { CartCreateResponseSchema } from '../api/schemas';
import { expectSchema } from '../utils/schema';
import { toCents } from '../utils/money';

export type CartLine = { productId: string; name: string; price: number; quantity: number };
export type FilledCart = { id: string; lines: CartLine[]; itemCount: number; total: number };

/** Only the product fields the cart needs. The full contract is checked by the API tests. */
const ProductPickSchema = z.object({
  data: z.array(z.object({ id: z.string(), name: z.string(), price: z.number() })).min(2),
});

/**
 * Hybrid fixtures plus filledCart: a cart arranged through the API with two products,
 * quantities 2 and 1. The expected lines and total are computed from the API's own
 * prices, never hardcoded. The cart is deleted afterwards.
 */
export const test = hybridTest.extend<{ filledCart: FilledCart }>({
  filledCart: async ({ cartsApi, productsApi }, use) => {
    const products = ProductPickSchema.parse(await (await productsApi.list()).json()).data;
    const picks = [
      { product: products[0], quantity: 2 },
      { product: products[1], quantity: 1 },
    ];

    const cart = expectSchema(CartCreateResponseSchema, await (await cartsApi.create()).json());
    for (const { product, quantity } of picks) {
      const added = await cartsApi.addItem(cart.id, product.id, quantity);
      expect(added.ok(), `adding ${product.name} to the cart`).toBe(true);
    }

    const lines = picks.map(({ product, quantity }) => ({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
    }));
    const totalCents = lines.reduce((sum, line) => sum + toCents(line.price) * line.quantity, 0);

    await use({
      id: cart.id,
      lines,
      itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
      total: totalCents / 100,
    });

    // A completed checkout may already have removed the cart, so the result is not checked.
    await cartsApi.delete(cart.id);
  },
});

export { expect };
