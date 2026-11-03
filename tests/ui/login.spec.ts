import { test, expect } from '@playwright/test';


test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

 test('customer can log in with valid credentials', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    await page.getByTestId('email').fill(process.env.CUSTOMER_EMAIL!);
    await page.getByTestId('password').fill(process.env.CUSTOMER_PASSWORD!);
    await page.getByTestId('login-submit').click();

    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByTestId('page-title')).toHaveText('My account');
    await expect(page.getByTestId('nav-menu')).toContainText('Jane Doe');
  });

  test('shows an error for an invalid password', { tag: '@regression' }, async ({ page }) => {
    await page.getByTestId('email').fill(process.env.NEGATIVE_EMAIL!);
    await page.getByTestId('password').fill('WrongPassword123');
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('login-error')).toHaveText('Invalid email or password');
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  const emptyFieldCases = [
    { name: 'email is empty', email: '', password: 'welcome01', field: 'email-error', message: 'Email is required' },
    { name: 'password is empty', email: 'customer@practicesoftwaretesting.com', password: '', field: 'password-error', message: 'Password is required' },
  ];

  for (const { name, email, password, field, message } of emptyFieldCases) {
    test(`shows a validation error when ${name}`, { tag: '@regression' }, async ({ page }) => {
      await page.getByTestId('email').fill(email);
      await page.getByTestId('password').fill(password);
      await page.getByTestId('login-submit').click();

      await expect(page.getByTestId(field)).toHaveText(message);
      await expect(page).toHaveURL(/\/auth\/login$/);
    });
  }

  test('shows both errors when all fields are empty', { tag: '@regression' }, async ({ page }) => {
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('email-error')).toHaveText('Email is required');
    await expect(page.getByTestId('password-error')).toHaveText('Password is required');
  });
});