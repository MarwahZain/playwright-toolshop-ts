import { test, expect } from '../../src/fixtures/cart';
import { mockInvoiceCreationError } from '../../src/mocks/invoices';
import { useCartInBrowser } from '../../src/utils/browser-cart';
import { storageStatePath } from '../../src/global-setup';
import checkoutData from '../../test-data/checkout.json';

/**
 * After "Payment was successful", the order is created by POST /invoices. If that request
 * fails, the customer must be told: otherwise they believe they have paid and ordered.
 * The failure is mocked, so no order is placed.
 */

// Checkout needs a signed-in customer: start with the session saved by global setup.
test.use({ storageState: storageStatePath('customer') });

test(
  'a rejected order shows an error instead of looking successful',
  { tag: ['@mocked', '@regression'] },
  async ({ page, cartPage, checkoutPage, filledCart }) => {
    test.fail(
      true,
      'Known bug: when POST /invoices fails, the checkout shows no error and no confirmation; the error is swallowed (issue #TBD)',
    );

    await useCartInBrowser(page, filledCart.id, filledCart.itemCount);
    const mock = await mockInvoiceCreationError(page);

    await cartPage.open();
    await cartPage.proceedToCheckout();
    await checkoutPage.proceedAfterSignIn.click();
    await checkoutPage.fillBillingAddress(checkoutData.billingAddress);
    await checkoutPage.confirmBillingAddress();
    await checkoutPage.pay({ method: 'cash-on-delivery' });
    await expect(checkoutPage.successMessage).toBeVisible();

    // Confirm the order: the invoice creation is rejected by the mock
    await checkoutPage.finish();
    await expect
      .poll(() => mock.calls, { message: 'the order request should be answered by the mock' })
      .toBeGreaterThan(0);

    await expect(
      checkoutPage.errorMessage,
      'the customer should be told the order failed',
    ).toBeVisible();
    await expect(checkoutPage.confirmedInvoiceNumber).toBeHidden();
  },
);
