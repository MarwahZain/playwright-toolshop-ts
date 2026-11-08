import { test, expect } from '../../src/fixtures/pages';
import { storageStatePath } from '../../src/global-setup';
import checkoutData from '../../test-data/checkout.json';
import productData from '../../test-data/products.json';

/**
 * The full journey a customer makes, entirely in the UI: nothing is arranged
 * through the API. Other checkout tests start from an API cart to stay fast;
 * this one proves the whole path connects.
 *
 * Known risk: every run places a real order on the shared customer account
 * (Jane Doe). This is safe while no test counts or sorts that account's orders.
 * Tests that need an isolated account should use a fresh user per test (M5 task).
 */

// The checkout's sign-in step needs a signed-in customer: start with the saved session.
test.use({ storageState: storageStatePath('customer') });

const product = productData.products[0];

test(
  'a customer finds a product, adds it to the cart and completes the order',
  { tag: ['@e2e', '@regression'] },
  async ({ homePage, productPage, cartPage, checkoutPage }) => {
    // Find the product and add it to the cart
    await homePage.openAndWaitForProducts();
    await homePage.openProduct(product.name);
    await expect(productPage.name).toHaveText(product.name);
    await productPage.addToCart();
    await expect(productPage.header.cartBadge.count).toHaveText('1');

    // The cart shows it
    await cartPage.open();
    await expect(cartPage.productTitles).toHaveText([product.name]);

    // Checkout: sign-in step, address, payment
    await cartPage.proceedToCheckout();
    await checkoutPage.proceedAfterSignIn.click();
    // The app looks up street, city and state from country, postal code and house number
    const looked = await checkoutPage.fillBillingAddress(checkoutData.billingAddress);
    await expect(checkoutPage.street).toHaveValue(looked.street);
    await expect(checkoutPage.city).toHaveValue(looked.city);
    await expect(checkoutPage.state).toHaveValue(looked.state);
    await checkoutPage.confirmBillingAddress();
    await checkoutPage.pay({ method: 'cash-on-delivery' });

    // The order is confirmed with an invoice number
    await expect(checkoutPage.successMessage).toBeVisible();
    expect(await checkoutPage.confirmOrder()).toMatch(/^INV-\d+$/);
  },
);
