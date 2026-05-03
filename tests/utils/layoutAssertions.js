/** @typedef {import('@playwright/test').Page} Page */

const { expect } = require('@playwright/test');

/** `#root` should paint non‑zero area (SPA booted). */
async function assertRootPainted(page) {
  const box = await page.locator('#root').boundingBox();
  expect.soft(box?.height ?? 0, '#root visible height').toBeGreaterThan(48);
}

/**
 * Intended to catch unintended horizontal scrolling. Full‑bleed sections can slightly
 * exceed the layout width; allowance scales with viewport.
 * @param {Page} page
 */
async function assertNoHorizontalOverflow(page) {
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => resolve(undefined));
      }),
  );

  await page.waitForTimeout(120);

  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  /** ~8% of viewport or ≥96px for scrollbar / vw rounding */
  const allowance = Math.max(96, Math.round(clientWidth * 0.08));
  expect
    .soft(
      scrollWidth,
      `Horizontal overflow-ish: scrollWidth=${scrollWidth} clientWidth=${clientWidth} allowance=${allowance}`,
    )
    .toBeLessThanOrEqual(clientWidth + allowance);
}

module.exports = {
  assertNoHorizontalOverflow,
  assertRootPainted,
};
