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
  readonly pagination: Locator;
  readonly activePage: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByTestId('search-query');
    this.searchSubmit = page.getByTestId('search-submit');
    this.sortSelect = page.getByTestId('sort');
    this.cards = ProductCardComponent.all(page);
    this.productNames = page.getByTestId('product-name');
    this.productPrices = page.getByTestId('product-price');
    this.noResults = page.getByTestId('no-results');
    // No test id or role exposed for the pagination list, so a CSS locator is the only option.
    // eslint-disable-next-line playwright/no-raw-locators
    this.pagination = page.locator('ul.pagination');
    // eslint-disable-next-line playwright/no-raw-locators
    this.activePage = this.pagination.locator('.active');
  }

  /** Opens the home page and returns the first products response (contains paging metadata). */
  async openAndWaitForProducts(): Promise<Response> {
    return waitForProducts(this.page, () => this.open());
  }

  async searchFor(term: string): Promise<Response> {
    const response = this.page.waitForResponse(
      (res) => res.url().includes('/products/search') && res.ok(),
    );
    await this.searchInput.fill(term);
    await this.searchSubmit.click();
    return response;
  }

  async goToPage(label: string): Promise<Response> {
    return waitForProducts(this.page, () =>
      this.pagination.getByText(label, { exact: true }).click(),
    );
  }

  async goToNextPage(): Promise<Response> {
    return waitForProducts(this.page, () => this.pagination.getByLabel('Next').click());
  }

  async goToPreviousPage(): Promise<Response> {
    return waitForProducts(this.page, () => this.pagination.getByLabel('Previous').click());
  }

  async toggleCategory(category: string): Promise<Response> {
    return waitForProducts(this.page, () =>
      this.page.getByLabel(category, { exact: true }).click(),
    );
  }

  async toggleBrand(brand: string): Promise<Response> {
    return waitForProducts(this.page, () => this.page.getByLabel(brand, { exact: true }).click());
  }

  async sortBy(option: SortOption): Promise<Response> {
    return waitForProducts(this.page, () => this.sortSelect.selectOption(option));
  }

  /** The card of the product with this name. Name and price are scoped to that card. */
  card(name: string): ProductCardComponent {
    return new ProductCardComponent(this.cards.filter({ hasText: name }).first());
  }

  async openProduct(name: string): Promise<void> {
    await this.card(name).open();
  }

  async getNames(): Promise<string[]> {
    return (await this.productNames.allTextContents()).map((t) => t.trim());
  }

  async getPrices(): Promise<number[]> {
    const texts = await this.productPrices.allTextContents();
    return texts.map(parsePrice);
  }
}
