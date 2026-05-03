// @ts-check
const { test } = require('@playwright/test');
const {
  STORE_PUBLIC_ROUTES,
  ADMIN_PUBLIC_ROUTES,
} = require('./utils/routes');
const { runAccessibilityScan, assertImpactViolations } = require('./utils/a11y');

/**
 * Contrast / semantics / landmarks (WCAG 2 A + 2.1 AA via axe).
 * Tag @a11y — run explicitly: npm run test:e2e:a11y, or npm run test:e2e:all (includes these).
 */

test.describe('Accessibility axe @a11y', { tag: '@a11y' }, () => {
  test.describe.configure({ timeout: 120_000 });

  for (const { path, label } of STORE_PUBLIC_ROUTES) {
    test(`axe WCAG storefront ${label}`, async ({ page }) => {
      await page
        .goto(path, {
          waitUntil: 'networkidle',
          timeout: 60_000,
        })
        .catch(async () => {
          await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 60_000 });
        });

      const results = await runAccessibilityScan(page);
      assertImpactViolations(results);
    });
  }

  for (const { path, label } of ADMIN_PUBLIC_ROUTES) {
    test(`axe WCAG admin ${label}`, async ({ page }) => {
      await page.goto(path, {
        waitUntil: 'domcontentloaded',
        timeout: 60_000,
      });
      const results = await runAccessibilityScan(page);
      assertImpactViolations(results);
    });
  }
});
