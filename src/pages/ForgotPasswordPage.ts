import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ForgotPasswordPage extends BasePage {
  protected readonly path = '/auth/forgot-password';

  readonly email: Locator;
  readonly submitButton: Locator;
  readonly confirmation: Locator;

  constructor(page: Page) {
    super(page);
    this.email = page.getByTestId('email');
    this.submitButton = page.getByTestId('forgot-password-submit');
    // The success message is an alert; it fades out after 3 seconds, so check it right after submitting.
    this.confirmation = page.getByRole('alert');
  }

  async requestReset(email: string): Promise<void> {
    await this.email.fill(email);
    await this.submitButton.click();
  }
}
