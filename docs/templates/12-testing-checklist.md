# Testing Checklist & Results

Record what was actually run. Unrun = "not tested".

## Critical flows (E2E)
| Flow | Role | Automated? | Result | Date | Notes |
|---|---|---|---|---|---|

## Business rules (unit)
| Rule | Test file | Result |
|---|---|---|

## API & permissions
| Endpoint | Happy path | Validation error | Unauthenticated | Forbidden (other role / other owner) |
|---|---|---|---|---|

## Database
- [ ] Migrations apply on empty DB
- [ ] Seed idempotent (ran twice)
- [ ] Constraints reject invalid data

## Error & edge states
- [ ] Offline / API failure · [ ] Empty DB · [ ] Invalid input · [ ] Expired session
- [ ] 404 / unauthorised route · [ ] Long text / Unicode · [ ] Double submit · [ ] Large lists

## Responsive (screenshots reviewed)
| Screen | 390 | 768 | 1440 | Issues |
|---|---|---|---|---|

## Cross-browser
| Browser | Result |
|---|---|

## Accessibility (axe + keyboard)
| Page | axe violations | Keyboard OK | Notes |
|---|---|---|---|

## Performance (Lighthouse)
| Page | Perf | A11y | Best practices | SEO | LCP |
|---|---|---|---|---|---|

## Bugs
| # | Severity | Steps | Expected | Actual | Status |
|---|---|---|---|---|---|
