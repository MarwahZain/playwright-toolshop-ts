import { Locator, Page } from '@playwright/test';
import { z } from 'zod';
import { HeaderComponent } from './components/HeaderComponent';

/** What the user types. Street, city and state are filled in by the app's postcode lookup. */
export type BillingAddress = {
  country: string;
  postalCode: string;
  houseNumber: string;
};

/** The part of GET /postcode-lookup that the form shows. */
const LookedUpAddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
});
export type LookedUpAddress = z.infer<typeof LookedUpAddressSchema>;

/**
 * A payment and exactly the fields its method needs. TypeScript checks that a payment
 * never mixes fields of different methods, like a sealed interface with one record per method.
 */
export type Payment =
  | { method: 'cash-on-delivery' }
  | { method: 'bank-transfer'; bankName: string; accountName: string; accountNumber: string }
  | {
      method: 'credit-card';
      cardNumber: string;
      expirationDate: string;
      cvv: string;
      cardHolderName: string;
    }
  | { method: 'buy-now-pay-later'; monthlyInstallments: '3' | '6' | '9' | '12' }
  | { method: 'gift-card'; giftCardNumber: string; validationCode: string };

export type PaymentMethod = Payment['method'];

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
  readonly bankName: Locator;
  readonly accountName: Locator;
  readonly accountNumber: Locator;
  readonly cardNumber: Locator;
  readonly expirationDate: Locator;
  readonly cvv: Locator;
  readonly cardHolderName: Locator;
  readonly monthlyInstallments: Locator;
  readonly giftCardNumber: Locator;
  readonly validationCode: Locator;
  readonly finishButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  /** The invoice number shown in the order confirmation, e.g. "INV-20260000163". */
  readonly confirmedInvoiceNumber: Locator;

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
    this.bankName = page.getByTestId('bank_name');
    this.accountName = page.getByTestId('account_name');
    this.accountNumber = page.getByTestId('account_number');
    this.cardNumber = page.getByTestId('credit_card_number');
    this.expirationDate = page.getByTestId('expiration_date');
    this.cvv = page.getByTestId('cvv');
    this.cardHolderName = page.getByTestId('card_holder_name');
    this.monthlyInstallments = page.getByTestId('monthly_installments');
    this.giftCardNumber = page.getByTestId('gift_card_number');
    this.validationCode = page.getByTestId('validation_code');
    this.finishButton = page.getByTestId('finish');
    this.successMessage = page.getByTestId('payment-success-message');
    this.errorMessage = page.getByTestId('payment-error-message');
    this.confirmedInvoiceNumber = page.getByText(/INV-\d+/);
  }

  /**
   * Enters country, postal code and house number, and returns the address the app's
   * postcode lookup filled in. Street, city and state are left as the lookup set them:
   * the backend rejects an order whose city does not match the lookup.
   */
  async fillBillingAddress(address: BillingAddress): Promise<LookedUpAddress> {
    await this.country.selectOption({ label: address.country });
    await this.postalCode.fill(address.postalCode);
    const lookup = this.page.waitForResponse(
      (res) =>
        new URL(res.url()).pathname === '/postcode-lookup' &&
        res.request().method() === 'GET' &&
        res.ok(),
    );
    await this.houseNumber.fill(address.houseNumber);
    return LookedUpAddressSchema.parse(await (await lookup).json());
  }

  /** Continues to payment. The button is enabled once the lookup has completed the address. */
  async confirmBillingAddress(): Promise<void> {
    await this.proceedAfterAddress.click();
  }

  async choosePayment(method: PaymentMethod): Promise<void> {
    await this.paymentMethod.selectOption(method);
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  /** Chooses the payment method, fills only that method's fields, and confirms. */
  async pay(payment: Payment): Promise<void> {
    await this.choosePayment(payment.method);
    switch (payment.method) {
      case 'cash-on-delivery':
        break;
      case 'bank-transfer':
        await this.bankName.fill(payment.bankName);
        await this.accountName.fill(payment.accountName);
        await this.accountNumber.fill(payment.accountNumber);
        break;
      case 'credit-card':
        await this.cardNumber.fill(payment.cardNumber);
        await this.expirationDate.fill(payment.expirationDate);
        await this.cvv.fill(payment.cvv);
        await this.cardHolderName.fill(payment.cardHolderName);
        break;
      case 'buy-now-pay-later':
        await this.monthlyInstallments.selectOption(payment.monthlyInstallments);
        break;
      case 'gift-card':
        await this.giftCardNumber.fill(payment.giftCardNumber);
        await this.validationCode.fill(payment.validationCode);
        break;
    }
    await this.finish();
  }

  /**
   * After "Payment was successful", confirms once more to place the order, and returns
   * the invoice number the confirmation shows.
   */
  async confirmOrder(): Promise<string> {
    await this.successMessage.waitFor();
    await this.finish();
    await this.confirmedInvoiceNumber.waitFor();
    const text = (await this.confirmedInvoiceNumber.textContent()) ?? '';
    const invoiceNumber = text.match(/INV-\d+/)?.[0];
    if (!invoiceNumber) throw new Error(`No invoice number in the confirmation: "${text}"`);
    return invoiceNumber;
  }
}
