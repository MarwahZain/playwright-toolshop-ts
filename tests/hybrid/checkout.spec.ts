import { test, expect } from '../../src/fixtures/cart';
import { useCartInBrowser } from '../../src/utils/browser-cart';
import { storageStatePath } from '../../src/global-setup';
import { toCents } from '../../src/utils/money';
import checkoutData from '../../test-data/checkout.json';

// Checkout needs a signed-in customer: start with the session saved by global setup.
test.use({ storageState: storageStatePath('customer') });

test.describe('Checkout with a cart filled through the API', () => {
  test.beforeEach(async ({ page, filledCart }) => {
    await useCartInBrowser(page, filledCart.id, filledCart.itemCount);
  });

  test(
    'the cart page shows the products, quantities and total from the API',
    { tag: ['@hybrid', '@regression'] },
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
    { tag: ['@hybrid', '@regression'] },
    async ({ cartPage, checkoutPage }) => {
      await cartPage.open();
      await cartPage.proceedToCheckout();

      await checkoutPage.proceedAfterSignIn.click();
      await checkoutPage.fillBillingAddress(checkoutData.billingAddress);
      await checkoutPage.confirmBillingAddress();
      await checkoutPage.pay({ method: 'cash-on-delivery' });

      await expect(checkoutPage.successMessage).toBeVisible();
      // "Payment was successful" alone does not mean an order exists: it must be confirmed.
      expect(await checkoutPage.confirmOrder()).toMatch(/^INV-\d+$/);
    },
  );
});
