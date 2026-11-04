import { expect, Page } from '@playwright/test';
import { HeaderComponent } from './components/HeaderComponent';

export abstract class BasePage {
  readonly header: HeaderComponent;

  constructor(protected readonly page: Page) {
    this.header = new HeaderComponent(page);
  }

  protected abstract readonly path: string;

  async open(): Promise<void> {
    await this.page.goto(this.path);
  }

  async expectUrl(url: RegExp): Promise<void> {
    await expect(this.page).toHaveURL(url);
  }

  async expectTitle(title: RegExp): Promise<void> {
    await expect(this.page).toHaveTitle(title);
  }
}
