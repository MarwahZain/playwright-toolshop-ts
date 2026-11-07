import { Locator, Page } from '@playwright/test';
import { HeaderComponent } from './components/HeaderComponent';

export type BillingAddress = {
  country: string;
  postalCode: string;
  houseNumber: string;
  street: string;
  city: string;
  state: string;
};

export type PaymentMethod =
  'bank-transfer' | 'cash-on-delivery' | 'credit-card' | 'buy-now-pay-later' | 'gift-card';

export class CheckoutPage {
  readonly header: HeaderComponent;
  readonly proceedAfterSignIn: Locator;
  readonly country: Locator;
  readonly postalCode: Locator;
  readonly houseNumber: Locator;
  readonly street: Locator;
  readonly city: Locator;
  readonly state: Locator;
  readonly proceedAfterAddress: Locator;
  readonly paymentMethod: Locator;
  readonly finishButton: Locator;
  readonly successMessage: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.proceedAfterSignIn = page.getByTestId('proceed-2');
    // Located by their visible labels, which match the form a user fills in.
    this.country = page.getByLabel('Country', { exact: true });
    this.postalCode = page.getByLabel('Postal code', { exact: true });
    this.houseNumber = page.getByLabel('House number', { exact: true });
    this.street = page.getByLabel('Street', { exact: true });
    this.city = page.getByLabel('City', { exact: true });
    this.state = page.getByLabel('State', { exact: true });
    this.proceedAfterAddress = page.getByTestId('proceed-3');
    this.paymentMethod = page.getByTestId('payment-method');
    this.finishButton = page.getByTestId('finish');
    this.successMessage = page.getByTestId('payment-success-message');
  }

  /**
   * Fills the billing address and continues. Country, postal code and house number go first:
   * the app may look up the rest from them, so street, city and state are set afterwards.
   */
  async fillBillingAddress(address: BillingAddress): Promise<void> {
    await this.country.selectOption({ label: address.country });
    await this.postalCode.fill(address.postalCode);
    await this.houseNumber.fill(address.houseNumber);
    await this.street.fill(address.street);
    await this.city.fill(address.city);
    await this.state.fill(address.state);
    await this.proceedAfterAddress.click();
  }

  async choosePayment(method: PaymentMethod): Promise<void> {
    await this.paymentMethod.selectOption(method);
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
