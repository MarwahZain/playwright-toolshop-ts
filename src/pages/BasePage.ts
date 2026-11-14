import { expect, Locator, Page } from '@playwright/test';
import { HeaderComponent } from './components/HeaderComponent';

export abstract class BasePage {
  readonly header: HeaderComponent;
  /** The chat and live-activity buttons floating on every page; masked in visual snapshots. */
  readonly floatingWidgets: Locator[];

  constructor(protected readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.floatingWidgets = [
      page.getByTestId('chat-toggle'),
      page.getByTestId('live-activity-toggle'),
    ];
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
