import { Locator, Page } from '@playwright/test';

export class ProductPage {
  readonly name: Locator;
  readonly unitPrice: Locator;
  readonly quantity: Locator;
  readonly increaseQuantity: Locator;
  readonly decreaseQuantity: Locator;
  readonly addToCartButton: Locator;
  readonly addedToCartToast: Locator;

  constructor(private readonly page: Page) {
    this.name = page.getByTestId('product-name');
    this.unitPrice = page.getByTestId('unit-price');
    this.quantity = page.getByTestId('quantity');
    this.increaseQuantity = page.getByTestId('increase-quantity');
    this.decreaseQuantity = page.getByTestId('decrease-quantity');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.addedToCartToast = page.getByRole('alert');
  }

  async setQuantity(qty: number): Promise<void> {
    await this.quantity.fill(String(qty));
  }

  async addToCart(qty = 1): Promise<void> {
    if (qty !== 1) await this.setQuantity(qty);
    await this.addToCartButton.click();
  }

  async getUnitPrice(): Promise<number> {
    return Number((await this.unitPrice.textContent())?.replace(/[^0-9.]/g, ''));
  }
}