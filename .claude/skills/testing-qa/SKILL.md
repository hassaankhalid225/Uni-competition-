---
name: testing-qa
description: Testing and quality assurance for hackathon products - risk-based test plans, unit tests for business rules (Vitest/pytest), API and integration tests, database and permission tests, Playwright end-to-end and visual/responsive screenshots, cross-browser, accessibility (axe), performance (Lighthouse), error-state testing and the final regression pass. Use when writing tests, verifying a feature works, checking responsiveness or accessibility, or before a demo/submission.
---

# Testing & Quality Assurance

The goal is a product that **actually works in the live demo**. Test what would embarrass us,
in proportion to the time available. Record results in `docs/project/12-testing-checklist.md`.

## Risk-based priorities
1. Critical user flows (the demo path) — E2E, every role.
2. Business rules (status transitions, conflicts, calculations, permissions) — unit tests.
3. API contracts + authorisation — integration tests incl. forbidden cases.
4. Error, empty and edge states — manual + a few E2E.
5. Responsive + accessibility + performance — screenshots, axe, Lighthouse.

## Tooling (install only after the stack exists)
- Unit/integration: **Vitest** + Testing Library (JS/TS), **pytest** (Python).
- E2E/visual: **Playwright** (`@playwright/test`). In this environment a Chromium build is
  pre-installed; do not run `playwright install`. Pass `--trace off` unless debugging.
- Accessibility: `@axe-core/playwright`.
- Performance: Lighthouse (`npx lighthouse <url> --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless --no-sandbox"`).
- API: Playwright `request` fixture or Vitest + `fetch` against a running dev server.

## Patterns
**Unit (business rule)**
```ts
it('rejects overlapping bookings', () => {
  expect(canBook(existing, { start: '10:00', end: '11:00' })).toEqual({ ok: false, reason: 'OVERLAP' });
});
```
**E2E critical flow (Playwright)**
```ts
test('staff approves a pending request', async ({ page }) => {
  await login(page, 'staff@demo.test');
  await page.getByRole('link', { name: 'Requests' }).click();
  await page.getByRole('row', { name: /pending/i }).first().getByRole('button', { name: 'Approve' }).click();
  await expect(page.getByText('Request approved')).toBeVisible();
});
```
Use role-based locators (`getByRole`, `getByLabel`) — they double as an accessibility check.

**Responsive screenshots**
```ts
for (const width of [390, 768, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  await page.screenshot({ path: `shots/${name}-${width}.png`, fullPage: true });
}
```
Then *look at them* (Read tool on the PNG) and note issues.

**Permission tests** — for each role, attempt a forbidden action via UI and via direct API call;
expect redirect/403.

**Database** — migrations apply cleanly on an empty DB; seed is idempotent (run twice);
constraints reject invalid data (insert duplicate/overlap → error).

## Error-state checklist
Network failure (DevTools offline), slow 3G, empty DB, invalid form input, expired session,
404 route, unauthorised route, very long text, special characters/Unicode, large lists, double
submit.

## Cross-browser
Chromium (primary), plus Firefox and WebKit via Playwright projects if time allows; at minimum
manually open in Safari/Firefox for the demo machine's browser.

## Final regression pass (before demo/submission)
- [ ] Fresh clone → install → env → migrate → seed → run, following the README exactly
- [ ] Full demo script executed twice without errors, on the deployed URL and locally
- [ ] All roles' main flows pass; no console errors; no dead links/buttons
- [ ] Lighthouse: performance ≥ 85, accessibility ≥ 95 on key pages (record actual numbers)
- [ ] Screenshots at 390/768/1440 reviewed
- [ ] Production build passes with zero type errors

Report honestly: list what was run, results, and what remains unverified.
