import { test, expect } from '@playwright/test';


test.describe('Login', () => {
  test('customer can log in with valid credentials', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    await page.goto('/auth/login');

    await page.getByTestId('email').fill(process.env.CUSTOMER_EMAIL!);
    await page.getByTestId('password').fill(process.env.CUSTOMER_PASSWORD!);
    await page.getByTestId('login-submit').click();

    // Landed on the account page
    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByTestId('page-title')).toHaveText('My account');

    // Header shows the logged-in user instead of "Sign in"
    await expect(page.getByTestId('nav-menu')).toContainText('Jane Doe');
    await expect(page.getByTestId('nav-sign-in')).toBeHidden();
  });
});