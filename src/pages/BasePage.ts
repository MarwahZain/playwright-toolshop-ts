import { Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected abstract readonly path: string;

  async open(): Promise<void> {
    await this.page.goto(this.path);
  }
}