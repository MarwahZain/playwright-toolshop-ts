import { Locator, Page } from '@playwright/test';
import { CartBadgeComponent } from './CartBadgeComponent';

export class HeaderComponent {
  readonly navHome: Locator;
  readonly navSignIn: Locator;
  readonly navMenu: Locator;
  readonly cartBadge: CartBadgeComponent;

  constructor(page: Page) {
    this.navHome = page.getByTestId('nav-home');
    this.navSignIn = page.getByTestId('nav-sign-in');
    this.navMenu = page.getByTestId('nav-menu');
    this.cartBadge = new CartBadgeComponent(page);
  }

  async goHome(): Promise<void> {
    await this.navHome.click();
  }

  async goToSignIn(): Promise<void> {
    await this.navSignIn.click();
  }
}
