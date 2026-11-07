import { z } from 'zod';
import { test as base, expect } from '../../src/fixtures/hybrid';
import { CartCreateResponseSchema } from '../../src/api/schemas';
import { expectSchema } from '../../src/utils/schema';
import { useCartInBrowser } from '../../src/utils/browser-cart';
import { storageStatePath } from '../../src/global-setup';
import checkoutData from '../../test-data/checkout.json';

type CartLine = { name: string; price: number; quantity: number };
type FilledCart = { id: string; lines: CartLine[]; itemCount: number; total: number };

/** Only the product fields this test uses. The full contract is checked by the API tests. */
const ProductPickSchema = z.object({
  data: z.array(z.object({ id: z.string(), name: z.string(), price: z.number() })).min(2),
});

/** Prices are added in cents, so totals have no floating-point rounding errors. */
const toCents = (amount: number) => Math.round(amount * 100);

const test = base.extend<{ filledCart: FilledCart }>({
  /**
   * Arranges a cart through the API: two products, quantities 2 and 1.
   * The expected lines and total are computed from the API's own prices, never hardcoded.
   */
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

// Checkout needs a signed-in customer: start with the session saved by global setup.
test.use({ storageState: storageStatePath('customer') });

test.describe('Checkout with a cart filled through the API', () => {
  test.beforeEach(async ({ page, filledCart }) => {
    await useCartInBrowser(page, filledCart.id, filledCart.itemCount);
  });

  test(
    'the cart page shows the products, quantities and total from the API',
    { tag: '@hybrid' },
    async ({ cartPage, filledCart }) => {
      await cartPage.open();

      await expect(cartPage.productTitles).toHaveText(filledCart.lines.map((line) => line.name));
      await expect(cartPage.linePrices).toHaveText(
        filledCart.lines.map(
          (line) => new RegExp(((toCents(line.price) * line.quantity) / 100).toFixed(2)),
        ),
      );
      await expect(cartPage.cartTotal).toContainText(filledCart.total.toFixed(2));
      await expect(cartPage.header.cartBadge.count).toHaveText(String(filledCart.itemCount));
    },
  );

  test(
    'a signed-in customer completes the checkout with cash on delivery',
    { tag: '@hybrid' },
    async ({ cartPage, checkoutPage }) => {
      await cartPage.open();
      await cartPage.proceedToCheckout();

      await checkoutPage.proceedAfterSignIn.click();
      await checkoutPage.fillBillingAddress(checkoutData.billingAddress);
      await checkoutPage.choosePayment('cash-on-delivery');
      await checkoutPage.finish();

      await expect(checkoutPage.successMessage).toBeVisible();
    },
  );
});
