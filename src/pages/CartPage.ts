import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  protected readonly path = '/checkout';

  readonly productTitles: Locator;
  readonly productQuantities: Locator;
  readonly linePrices: Locator;
  readonly cartTotal: Locator;
  readonly proceedButton: Locator;

  constructor(page: Page) {
    super(page);
    this.productTitles = page.getByTestId('product-title');
    this.productQuantities = page.getByTestId('product-quantity');
    this.linePrices = page.getByTestId('line-price');
    this.cartTotal = page.getByTestId('cart-total');
    this.proceedButton = page.getByTestId('proceed-1');
  }

  async proceedToCheckout(): Promise<void> {
    await this.proceedButton.click();
  }

  async getTotal(): Promise<number> {
    return Number((await this.cartTotal.textContent())?.replace(/[^0-9.]/g, ''));
  }
}