import { test, expect } from '../../../src/fixtures/pages';
import loginData from '../../../test-data/login.json';

const emptyFieldCases = loginData.emptyFieldCases as {
  name: string;
  email: string;
  password: string;
  error: 'emailError' | 'passwordError';
  message: string;
}[];

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test(
    'customer can log in with valid credentials',
    // No @smoke: the public demo site serves a Cloudflare bot challenge to CI runners.
    { tag: '@regression' },
    async ({ loginPage, accountPage }) => {
      await loginPage.login(loginData.validCustomer.email, loginData.validCustomer.password);

      await accountPage.expectUrl(/\/account$/);
      await expect(accountPage.pageTitle).toHaveText('My account');
      await expect(accountPage.header.navMenu).toContainText(loginData.customerName);
    },
  );

  test('shows an error for an invalid password', { tag: '@regression' }, async ({ loginPage }) => {
    await loginPage.login(loginData.invalidCustomer.email, loginData.invalidCustomer.password);

    await expect(loginPage.loginError).toHaveText(loginData.invalidCredentialsMessage);
    await loginPage.expectUrl(/\/auth\/login$/);
  });

  for (const { name, email, password, error, message } of emptyFieldCases) {
    test(`shows a validation error when ${name}`, { tag: '@regression' }, async ({ loginPage }) => {
      await loginPage.login(email, password);
      await expect(loginPage[error]).toHaveText(message);
    });
  }

  test(
    'shows both errors when all fields are empty',
    { tag: '@regression' },
    async ({ loginPage }) => {
      await loginPage.submit();

      await expect(loginPage.emailError).toHaveText('Email is required');
      await expect(loginPage.passwordError).toHaveText('Password is required');
    },
  );
});
