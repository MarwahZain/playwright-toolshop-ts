import { expect } from '@playwright/test';
import { Given, When, Then } from '../fixtures';

Given('I am on the homepage', async ({ homePage }) => {
  await homePage.open();
});

When('I search for {string}', async ({ homePage }, term: string) => {
  await homePage.searchFor(term);
});

Then('I should see results for {string}', async ({ homePage }, term: string) => {
  //Now Playwright goes to the page, finds all product names,
  //  keeps the ones without "bolt", counts them, and checks the count is 0.
  // If it isn't 0 yet (for example, the old products are still on screen while the search loads),
  // it looks again, and again, until it's 0 or the 5-second timeout runs out.
  await expect(homePage.productNames.filter({ hasNotText: new RegExp(term, 'i') })).toHaveCount(0);
  await expect(homePage.productNames).not.toHaveCount(0);
  //await expect(homePage.productNames).toContainText(term);

  //for (const name of await homePage.productNames.all()) {        // each product, one by one
  //  await expect(name).toContainText(new RegExp(term, 'i'));     // this one contains the word
  // }
});

Then(
  'The summary says {int} products found for {string}',
  async ({ homePage }, count: number, term: string) => {
    const noun = count === 1 ? 'product' : 'products';
    await expect(homePage.searchResultsCount).toHaveText(`${count} ${noun} found for '${term}'`);
  },
);
