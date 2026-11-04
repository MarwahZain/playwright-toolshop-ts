import { Locator, Page } from '@playwright/test';

export class CartBadgeComponent {
  readonly count: Locator;

  constructor(page: Page) {
    this.count = page.getByTestId('cart-quantity');
  }

  /** Returns the number shown on the cart badge, or 0 when the badge is not visible. */
  async getCount(): Promise<number> {
    if (!(await this.count.isVisible())) return 0;
    const text = (await this.count.textContent())?.trim();
    return text ? Number(text) : 0;
  }
}
