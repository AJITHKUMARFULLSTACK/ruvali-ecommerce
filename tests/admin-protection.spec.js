// @ts-check
const { test, expect } = require('@playwright/test');
const { ADMIN_PROTECTED_PATHS } = require('./utils/routes');

test.describe('admin JWT gate', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await page.evaluate(() => {
      try {
        localStorage.clear();
      } catch {
        /* ignore */
      }
    });
  });

  for (const path of ADMIN_PROTECTED_PATHS) {
    test(`redirects ${path} to login when offline admin`, async ({ page }) => {
      const res = await page.goto(path, {
        waitUntil: 'domcontentloaded',
        timeout: 45_000,
      });
      expect(res.ok(), `${path} HTTP ${res?.status()}`).toBeTruthy();

      await expect(page).toHaveURL(/\/admin\/login(?:\/)?$/);
      await expect(page.locator('.admin-login')).toBeVisible();
      await expect(page.locator('#root')).toBeVisible();
    });
  }
});
