// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Dynamically resolves same-origin anchors from footer and verifies each renders.
 */

test.describe.configure({ timeout: 180_000 });

test('footer internal links smoke (same tab)', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle', timeout: 75_000 }).catch(() =>
    page.goto('/', { waitUntil: 'domcontentloaded', timeout: 75_000 }),
  );

  const anchors = await page.locator('footer.footer a[href^="/"]').all();
  const hrefs = new Set();

  for (const a of anchors) {
    const href = await a.getAttribute('href');
    if (href && href.startsWith('/') && !href.startsWith('//')) {
      /** Skip hash-only */
      const pathOnly = href.split(/[?#]/)[0];
      if (pathOnly.length > 0) hrefs.add(pathOnly);
    }
  }

  expect(hrefs.size, 'footer should expose at least one internal route').toBeGreaterThan(0);

  for (const path of [...hrefs]) {
    const res = await page.goto(path, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    expect(res.ok(), `${path} HTTP ${res?.status()}`).toBeTruthy();
    await expect(page.locator('#root')).toBeVisible();
  }
});
