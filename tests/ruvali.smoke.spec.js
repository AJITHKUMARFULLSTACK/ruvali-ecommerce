// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('RUVALI smoke', () => {
  test('storefront loads and #root is visible', async ({ page }) => {
    const res = await page.goto('/', {
      waitUntil: 'domcontentloaded',
      timeout: 45_000,
    });
    expect(res, 'navigation response').toBeTruthy();
    expect(res.ok(), `HTTP ${res?.status()}`).toBeTruthy();
    await expect(page.locator('#root')).toBeVisible({ timeout: 20_000 });
  });

  test('admin login route loads', async ({ page }) => {
    const res = await page.goto('/admin/login', {
      waitUntil: 'domcontentloaded',
      timeout: 45_000,
    });
    expect(res, 'navigation response').toBeTruthy();
    expect(res.ok(), `HTTP ${res?.status()}`).toBeTruthy();
    await expect(page.locator('#root')).toBeVisible({ timeout: 20_000 });
  });
});
