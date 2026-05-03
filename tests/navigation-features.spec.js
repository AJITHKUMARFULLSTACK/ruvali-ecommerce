// @ts-check
const { test, expect } = require('@playwright/test');
const { LEGACY_REDIRECTS } = require('./utils/routes');

test.describe('legacy URL redirects', () => {
  for (const { from, toPattern } of LEGACY_REDIRECTS) {
    test(`${from} → category`, async ({ page }) => {
      await page.goto(from, { waitUntil: 'domcontentloaded', timeout: 45_000 });
      await expect(page).toHaveURL(toPattern);
    });
  }
});

test.describe('home content & navigation affordances', () => {
  test('hero/home above-the-fold renders', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    /** Home markup: hero title + curated copy */
    const heroOrHome =
      page.locator('.luxury-content-spacer, .home').first();
    await expect(heroOrHome).toBeVisible({ timeout: 25_000 });
    await expect(page.locator('h2.section-title').first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test('cart control visible and clickable', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 45_000 });
    const cartBtn = page.locator('.top-nav-cart-btn');
    await expect(cartBtn).toBeVisible();
    await cartBtn.click();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.locator('#root')).toBeVisible();
    await expect(page.locator('main.main-content')).toBeVisible();
  });

  test('contact link in footer loads care page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 45_000 });
    const link = page.locator('footer.footer a[href="/contact"]').first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/contact$/);
  });

  test('mobile menu opens via hamburger (narrow viewports)', async ({
    page,
  }, testInfo) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 45_000 });
    const toggle = page.locator('.top-nav-toggle');
    /** Hidden on Desktop Chrome (>768 CSS width) */
    const canOpen = await toggle.isVisible().catch(() => false);
    if (!canOpen) {
      testInfo.skip(true, `Hamburger hidden in "${testInfo.project.name}"`);
    }
    await toggle.click();
    await expect(page.locator('.top-nav-mobile--open')).toBeVisible({
      timeout: 15_000,
    });
    const mobileLinks = page.locator('.top-nav-mobile-panel .top-nav-mobile-link');
    await expect(mobileLinks.first()).toBeVisible({ timeout: 15_000 });
    expect(await mobileLinks.count(), 'mobile drawer should list at least one link').toBeGreaterThan(0);
    await page.locator('.top-nav-mobile-close').click();
    await expect(page.locator('.top-nav-mobile--open')).toHaveCount(0);
  });
});
