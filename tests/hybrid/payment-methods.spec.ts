import { test, expect } from '../../src/fixtures/cart';
import { Payment } from '../../src/pages/CheckoutPage';
import { InvoiceResponseSchema } from '../../src/api/schemas';
import { expectSchema } from '../../src/utils/schema';
import { useCartInBrowser } from '../../src/utils/browser-cart';
import { storageStatePath } from '../../src/global-setup';
import checkoutData from '../../test-data/checkout.json';
import dataset from '../../test-data/payment-methods.json';

/**
 * Known risk: every run places a real order on the shared customer account
 * (Jane Doe). This is safe while no test counts or sorts that account's orders:
 * each test finds its own invoice by the number the confirmation shows.
 * Tests that need an isolated account should use a fresh user per test (M5 task).
 */

/** One row of test-data/payment-methods.json = one payment method to check out with. */
type PaymentCase = { id: string; description: string; payment: Payment };

// Checkout needs a signed-in customer: start with the session saved by global setup.
test.use({ storageState: storageStatePath('customer') });

test.describe('Checkout across payment methods', () => {
  test.beforeEach(async ({ page, filledCart }) => {
    await useCartInBrowser(page, filledCart.id, filledCart.itemCount);
  });

  for (const row of dataset as PaymentCase[]) {
    test(
      `${row.id} pays by ${row.description} and stores the matching invoice`,
      { tag: ['@hybrid', '@regression'] },
      async ({ cartPage, checkoutPage, invoicesApi, filledCart }) => {
        // 1. Go through checkout in the UI and pay with this row's method
        await cartPage.open();
        await cartPage.proceedToCheckout();
        await checkoutPage.proceedAfterSignIn.click();
        await checkoutPage.fillBillingAddress(checkoutData.billingAddress);
        await checkoutPage.confirmBillingAddress();
        await checkoutPage.pay(row.payment);

        // 2. The UI confirms the payment and the order
        await expect(checkoutPage.successMessage).toBeVisible();
        const invoiceNumber = await checkoutPage.confirmOrder();

        // 3. The backend stored exactly this order (looked up by the number on screen)
        const found = await invoicesApi.findByNumber(invoiceNumber);
        expect(found, `invoice ${invoiceNumber} should exist for the customer`).toBeDefined();
        const invoice = expectSchema(InvoiceResponseSchema, found);

        expect(invoice.payment.payment_method).toBe(row.payment.method);
        expect(invoice.total).toBeCloseTo(filledCart.total, 2);

        const stored = invoice.invoicelines.map((line) => ({
          productId: line.product_id,
          quantity: line.quantity,
        }));
        const ordered = filledCart.lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
        }));
        const byProduct = (a: { productId: string }, b: { productId: string }) =>
          a.productId.localeCompare(b.productId);
        expect(stored.sort(byProduct)).toEqual(ordered.sort(byProduct));
      },
    );
  }
});
