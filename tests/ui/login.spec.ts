import { test, expect } from '../../src/fixtures/pages';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('customer can log in with valid credentials', { tag: ['@smoke', '@regression'] }, async ({ page, loginPage }) => {
    await loginPage.login(process.env.CUSTOMER_EMAIL!, process.env.CUSTOMER_PASSWORD!);

    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByTestId('page-title')).toHaveText('My account');
    await expect(loginPage.header.navMenu).toContainText('Jane Doe');
  });

  test('shows an error for an invalid password', { tag: '@regression' }, async ({ page, loginPage }) => {
    await loginPage.login(process.env.NEGATIVE_EMAIL!, 'WrongPassword123');

    await expect(loginPage.loginError).toHaveText('Invalid email or password');
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  const emptyFieldCases = [
    { name: 'email is empty', email: '', password: 'welcome01', error: 'emailError', message: 'Email is required' },
    { name: 'password is empty', email: 'customer@practicesoftwaretesting.com', password: '', error: 'passwordError', message: 'Password is required' },
  ] as const;

  for (const { name, email, password, error, message } of emptyFieldCases) {
    test(`shows a validation error when ${name}`, { tag: '@regression' }, async ({ loginPage }) => {
      await loginPage.login(email, password);
      await expect(loginPage[error]).toHaveText(message);
    });
  }

  test('shows both errors when all fields are empty', { tag: '@regression' }, async ({ loginPage }) => {
    await loginPage.submitButton.click();

    await expect(loginPage.emailError).toHaveText('Email is required');
    await expect(loginPage.passwordError).toHaveText('Password is required');
  });
});