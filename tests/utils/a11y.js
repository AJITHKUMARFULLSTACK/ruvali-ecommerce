const { expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright');

/**
 * AXE_DISABLED_RULE_IDS — comma-separated (e.g. `color-contrast,meta-viewport`)
 * PLAYWRIGHT_A11Y_IMPACT — default `critical,serious`; use `all` for every impact.
 */

function disabledRuleIds() {
  return (process.env.PLAYWRIGHT_AXE_DISABLE_RULES || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function filterByImpact(violations) {
  const raw = (process.env.PLAYWRIGHT_A11Y_IMPACT || 'critical,serious').toLowerCase();
  if (raw === 'all' || raw === 'any') return violations;
  const allowed = new Set(raw.split(',').map((s) => s.trim()).filter(Boolean));
  return violations.filter((v) => v.impact != null && allowed.has(String(v.impact)));
}

/**
 * WCAG 2 A + 2.1 AA axe tags — includes contrast, labels, headings, landmarks.
 * @param {import('@playwright/test').Page} page
 */
async function runAccessibilityScan(page) {
  let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag21aa']);
  const disable = disabledRuleIds();
  if (disable.length) builder = builder.disableRules(disable);
  return builder.analyze();
}

/**
 * @param {import('@axe-core/playwright').AxeResults} results
 */
function formatViolations(results) {
  return JSON.stringify(
    filterByImpact(results.violations).map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.slice(0, 4).map((n) => n.html),
    })),
    null,
    2,
  );
}

/** @param {import('@axe-core/playwright').AxeResults} results */
function assertImpactViolations(results) {
  const list = filterByImpact(results.violations);
  if (list.length) {
    // eslint-disable-next-line no-console
    console.error(
      `[axe violations] (${list.length})\n`,
      formatViolations({ ...results, violations: list }),
    );
  }
  expect.soft(list).toEqual([]);
}

module.exports = {
  runAccessibilityScan,
  assertImpactViolations,
  formatViolations,
};
