// @ts-check
const { test, expect } = require('@playwright/test');
const {
  STORE_PUBLIC_ROUTES,
  ADMIN_PUBLIC_ROUTES,
} = require('./utils/routes');
const {
  assertNoHorizontalOverflow,
  assertRootPainted,
} = require('./utils/layoutAssertions');

/** Every store page exposes shell + renders content shell */
for (const { path, label } of STORE_PUBLIC_ROUTES) {
  test(`shell: storefront ${label} (${path})`, async ({ page }) => {
    const res = await page.goto(path, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    expect(res.ok(), `${path} HTTP ${res?.status()}`).toBeTruthy();

    await expect(page.locator('#root')).toBeVisible({ timeout: 25_000 });
    await expect(page.locator('.top-nav-wrapper')).toBeVisible();
    await expect(page.locator('main.main-content')).toBeVisible();

    /** Footer ships on storefront layout */
    await expect(page.locator('footer.footer')).toBeVisible();

    await assertRootPainted(page);
    await assertNoHorizontalOverflow(page);
  });
}

for (const { path, label } of ADMIN_PUBLIC_ROUTES) {
  test(`shell: admin public ${label}`, async ({ page }) => {
    const res = await page.goto(path, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    expect(res.ok(), `${path} HTTP ${res?.status()}`).toBeTruthy();

    await expect(page.locator('#root')).toBeVisible({ timeout: 25_000 });
    await expect(page.locator('.admin-login')).toBeVisible();

    /** Admin login UI */
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await assertRootPainted(page);
    await assertNoHorizontalOverflow(page);
  });
}
