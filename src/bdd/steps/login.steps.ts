import { expect } from '@playwright/test';
import { Given, When, Then } from '../fixtures';
import { customer } from '../../config/accounts';

Given('I am on the login page', async ({ loginPage }) => {
  await loginPage.open();
});

When('I log in as the customer', async ({ loginPage }) => {
  await loginPage.login(customer.email, customer.password);
});

When(
  'I log in as {string} with the password {string}',
  async ({ loginPage }, email: string, password: string) => {
    await loginPage.login(email, password);
  },
);

When('I submit the login form without filling it in', async ({ loginPage }) => {
  await loginPage.submit();
});

Then('I see my account page', async ({ accountPage }) => {
  await accountPage.expectUrl(/\/account$/);
  await expect(accountPage.pageTitle).toBeVisible();
});

Then("the menu shows the customer's name", async ({ accountPage }) => {
  await expect(accountPage.header.navMenu).toContainText(customer.name);
});

Then('I see the login error {string}', async ({ loginPage }, message: string) => {
  await expect(loginPage.loginError).toHaveText(message);
});

Then('I am still on the login page', async ({ loginPage }) => {
  await loginPage.expectUrl(/\/auth\/login$/);
});

Then('I see the email error {string}', async ({ loginPage }, message: string) => {
  await expect(loginPage.emailError).toHaveText(message);
});

Then('I see the password error {string}', async ({ loginPage }, message: string) => {
  await expect(loginPage.passwordError).toHaveText(message);
});
