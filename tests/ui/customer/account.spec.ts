import { test, expect } from '../../../src/fixtures/pages';
import loginData from '../../../test-data/login.json';

/**
 * Runs in the customer project, so every test starts with the customer's saved
 * session from global setup. No test here logs in through the UI.
 */
test.describe('Customer account', () => {
  test(
    'opens the account page directly, without logging in',
    { tag: ['@smoke', '@regression'] },
    async ({ accountPage }) => {
      await accountPage.open();

      // If the saved session did not work, the app redirects to /auth/login.
      await accountPage.expectUrl(/\/account$/);
      await expect(accountPage.pageTitle).toBeVisible();
      await expect(accountPage.header.navMenu).toContainText(loginData.customerName);
      await expect(accountPage.header.navSignIn).toBeHidden();
    },
  );

  test('stays signed in while browsing the shop', { tag: '@regression' }, async ({ homePage }) => {
    await homePage.openAndWaitForProducts();

    await expect(homePage.header.navMenu).toContainText(loginData.customerName);
    await expect(homePage.header.navSignIn).toBeHidden();
  });
});
