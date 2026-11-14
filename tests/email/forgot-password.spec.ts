import { test, expect, registerCustomer } from '../../src/fixtures/users';

/**
 * Password reset, end to end, including the email. Toolshop does not send a reset link:
 * it sets a new password immediately and emails it. Emails are queued and sent once a
 * minute, so each test may wait up to 90 seconds for its email. Runs against local
 * Docker only, where MailCatcher catches the shop's emails.
 *
 * Every test uses its own freshly registered customer: resetting a shared account's
 * password would break every other test that logs in with it.
 */
test.describe.configure({ timeout: 150_000 });

/** The new password, as written in the reset email: "Your password is set to: <password>". */
function passwordFrom(emailText: string): string | undefined {
  return emailText.match(/password is set to:\s*(\S+)/)?.[1];
}

test.describe('Forgot password', () => {
  test(
    'FP-01 a customer resets the password, receives it by email and logs in with it',
    { tag: ['@email', '@regression'] },
    async ({ forgotPasswordPage, loginPage, accountPage, authApi, mailCatcher, freshCustomer }) => {
      // 1. Request the reset in the UI
      await forgotPasswordPage.open();
      await forgotPasswordPage.requestReset(freshCustomer.email);
      // Its wording is wrong today (see FP-03), so only its presence is checked here
      await expect(forgotPasswordPage.confirmation).toBeVisible();

      // 2. The email arrives (queued, sent within about a minute)
      const email = await mailCatcher.waitForEmail(freshCustomer.email, 'Forget password');
      expect(email.sender).toBe('<hello@practicesoftwaretesting.com>');

      // 3. It greets the customer and contains the new password
      const text = await mailCatcher.readText(email.id);
      expect(text).toContain(`Hello ${freshCustomer.firstName} ${freshCustomer.lastName}`);
      const newPassword = passwordFrom(text);
      expect(newPassword, 'the email should contain the new password').toBeTruthy();

      // 4. The old password no longer works
      const oldLogin = await authApi.login(freshCustomer.email, freshCustomer.password);
      expect(oldLogin.status(), 'the old password should be rejected').toBe(401);

      // 5. The emailed password works in the UI
      await loginPage.open();
      await loginPage.login(freshCustomer.email, newPassword as string);
      await accountPage.expectUrl(/\/account$/);
      await expect(accountPage.header.navMenu).toContainText(
        `${freshCustomer.firstName} ${freshCustomer.lastName}`,
      );
    },
  );

  test(
    'FP-02 each reset gets its own password, not a guessable one',
    { tag: ['@email', '@regression'] },
    async ({ authApi, addressesApi, mailCatcher }) => {
      test.fail(
        true,
        'Known bug: password reset sets the same fixed password for every account; anyone who knows an email can take over the account (issue #TBD)',
      );

      const first = await registerCustomer(authApi, addressesApi);
      const second = await registerCustomer(authApi, addressesApi);
      expect((await authApi.forgotPassword(first.email)).ok()).toBe(true);
      expect((await authApi.forgotPassword(second.email)).ok()).toBe(true);

      const [firstEmail, secondEmail] = await Promise.all([
        mailCatcher.waitForEmail(first.email, 'Forget password'),
        mailCatcher.waitForEmail(second.email, 'Forget password'),
      ]);
      const firstPassword = passwordFrom(await mailCatcher.readText(firstEmail.id));
      const secondPassword = passwordFrom(await mailCatcher.readText(secondEmail.id));

      expect(firstPassword).toBeTruthy();
      expect(firstPassword, 'two accounts should never be reset to the same password').not.toBe(
        secondPassword,
      );
    },
  );

  test(
    'FP-03 the reset confirmation tells the customer the password was updated',
    { tag: ['@email', '@regression'] },
    async ({ forgotPasswordPage, freshCustomer }) => {
      test.fail(
        true,
        'Known bug: the reset confirmation shows the untranslated key page.forgot-password.confirm instead of its text (issue #TBD)',
      );

      await forgotPasswordPage.open();
      await forgotPasswordPage.requestReset(freshCustomer.email);

      await expect(forgotPasswordPage.confirmation).toHaveText(
        'Your password is successfully updated!',
      );
    },
  );
});
