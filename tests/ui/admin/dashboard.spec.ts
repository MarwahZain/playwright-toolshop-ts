import { test, expect } from '../../../src/fixtures/pages';
import loginData from '../../../test-data/login.json';

/**
 * Runs in the admin project, so every test starts with the admin's saved
 * session from global setup. No test here logs in through the UI.
 */
test.describe('Admin dashboard', () => {
  test(
    'opens the dashboard directly, without logging in',
    { tag: ['@smoke', '@regression'] },
    async ({ adminDashboardPage }) => {
      await adminDashboardPage.open();

      // If the saved session did not work, the app redirects to /auth/login.
      await adminDashboardPage.expectUrl(/\/admin\/dashboard$/);
      await expect(adminDashboardPage.header.navMenu).toContainText(loginData.adminName);
      await expect(adminDashboardPage.header.navSignIn).toBeHidden();
    },
  );
});
