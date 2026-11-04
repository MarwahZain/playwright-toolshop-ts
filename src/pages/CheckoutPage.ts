import { Locator, Page } from '@playwright/test';
import { HeaderComponent } from './components/HeaderComponent';

export type BillingAddress = {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
};

export type PaymentMethod =
  'bank-transfer' | 'cash-on-delivery' | 'credit-card' | 'buy-now-pay-later' | 'gift-card';

export class CheckoutPage {
  readonly header: HeaderComponent;
  readonly proceedAfterSignIn: Locator;
  readonly street: Locator;
  readonly city: Locator;
  readonly state: Locator;
  readonly country: Locator;
  readonly postalCode: Locator;
  readonly proceedAfterAddress: Locator;
  readonly paymentMethod: Locator;
  readonly finishButton: Locator;
  readonly successMessage: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.proceedAfterSignIn = page.getByTestId('proceed-2');
    this.street = page.getByTestId('street');
    this.city = page.getByTestId('city');
    this.state = page.getByTestId('state');
    this.country = page.getByTestId('country');
    this.postalCode = page.getByTestId('postal_code');
    this.proceedAfterAddress = page.getByTestId('proceed-3');
    this.paymentMethod = page.getByTestId('payment-method');
    this.finishButton = page.getByTestId('finish');
    this.successMessage = page.getByTestId('payment-success-message');
  }

  async fillBillingAddress(address: BillingAddress): Promise<void> {
    await this.street.fill(address.street);
    await this.city.fill(address.city);
    await this.state.fill(address.state);
    await this.country.fill(address.country);
    await this.postalCode.fill(address.postalCode);
    await this.proceedAfterAddress.click();
  }

  async choosePayment(method: PaymentMethod): Promise<void> {
    await this.paymentMethod.selectOption(method);
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
