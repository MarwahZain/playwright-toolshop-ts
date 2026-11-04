import { Locator, Page } from '@playwright/test';
import { parsePrice } from '../../utils/price';

/** Each product card has a `product-<id>` test id; the name and price test ids are its children. */
const CARD_SELECTOR =
  '[data-test^="product-"]:not([data-test="product-name"]):not([data-test="product-price"])';

export class ProductCardComponent {
  readonly name: Locator;
  readonly price: Locator;

  constructor(private readonly root: Locator) {
    this.name = root.getByTestId('product-name');
    this.price = root.getByTestId('product-price');
  }

  /** Locator for every product card on the page. */
  static all(page: Page): Locator {
    return page.locator(CARD_SELECTOR);
  }

  async getName(): Promise<string> {
    return ((await this.name.textContent()) ?? '').trim();
  }

  async getPrice(): Promise<number> {
    return parsePrice((await this.price.textContent()) ?? '');
  }

  async open(): Promise<void> {
    await this.name.click();
  }
}
