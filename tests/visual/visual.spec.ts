import { test, expect } from '../../src/fixtures/pages';

/**
 * Visual snapshots of two static pages, compared pixel by pixel with approved baselines.
 * Fonts and anti-aliasing differ between macOS and Linux, so baselines are made and compared
 * inside the Playwright Docker image only: `npm run visual` to compare, `npm run visual:update`
 * to approve an intended change. Outside Docker these tests are skipped.
 *
 * The floating chat and live-activity buttons are masked: they are not part of the page under test.
 */
// eslint-disable-next-line playwright/no-skipped-test -- deliberate: baselines must never be made on macOS
test.skip(
  process.env.VISUAL_DOCKER !== '1',
  'Visual snapshots run in the Playwright Docker image: use npm run visual',
);

test.describe('Visual snapshots', () => {
  test('VIS-01 login page', { tag: ['@visual', '@regression'] }, async ({ page, loginPage }) => {
    await loginPage.open();
    await expect(loginPage.submitButton).toBeVisible();

    await expect(page).toHaveScreenshot('login-page.png', { mask: loginPage.floatingWidgets });
  });

  test(
    'VIS-02 contact page',
    { tag: ['@visual', '@regression'] },
    async ({ page, contactPage }) => {
      await contactPage.open();
      await expect(contactPage.submitButton).toBeVisible();

      await expect(page).toHaveScreenshot('contact-page.png', {
        mask: contactPage.floatingWidgets,
      });
    },
  );
});
