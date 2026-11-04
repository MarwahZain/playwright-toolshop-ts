import { Locator, Page, Response } from '@playwright/test';
import { BasePage } from './BasePage';
import { waitForProducts } from '../utils/products';
import { parsePrice } from '../utils/price';
import { ProductCardComponent } from './components/ProductCardComponent';

export type SortOption = 'name,asc' | 'name,desc' | 'price,asc' | 'price,desc';

export class HomePage extends BasePage {
  protected readonly path = '/';

  readonly searchInput: Locator;
  readonly searchSubmit: Locator;
  readonly sortSelect: Locator;
  readonly cards: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;
  readonly noResults: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByTestId('search-query');
    this.searchSubmit = page.getByTestId('search-submit');
    this.sortSelect = page.getByTestId('sort');
    this.cards = ProductCardComponent.all(page);
    this.productNames = page.getByTestId('product-name');
    this.productPrices = page.getByTestId('product-price');
    this.noResults = page.getByTestId('no-results');
  }

  /** Opens the home page and returns the first products response (contains paging metadata). */
  async openAndWaitForProducts(): Promise<Response> {
    return waitForProducts(this.page, () => this.open());
  }

  async searchFor(term: string): Promise<Response> {
    await this.searchInput.fill(term);
    return waitForProducts(this.page, () => this.searchSubmit.click());
  }

  async toggleCategory(category: string): Promise<Response> {
    return waitForProducts(this.page, () =>
      this.page.getByLabel(category, { exact: true }).click(),
    );
  }

  async sortBy(option: SortOption): Promise<Response> {
    return waitForProducts(this.page, () => this.sortSelect.selectOption(option));
  }

  async openProduct(name: string): Promise<void> {
    const card = new ProductCardComponent(this.cards.filter({ hasText: name }).first());
    await card.open();
  }

  async getNames(): Promise<string[]> {
    return (await this.productNames.allTextContents()).map((t) => t.trim());
  }

  async getPrices(): Promise<number[]> {
    const texts = await this.productPrices.allTextContents();
    return texts.map(parsePrice);
  }
}