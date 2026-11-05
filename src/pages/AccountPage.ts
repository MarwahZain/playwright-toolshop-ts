import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AccountPage extends BasePage {
  protected readonly path = '/account';

  readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);
    //this.pageTitle = page.getByTestId('page-title');
    this.pageTitle = page.getByRole('heading', { name: 'My account' });
  }
}
