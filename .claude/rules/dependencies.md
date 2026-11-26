# Dependency Policy

Before installing any package, answer all four in your head (and in the commit message for
non-trivial deps):

1. **Need** — Does the platform/framework or an existing dependency already do this? (`fetch`,
   `Intl`, `crypto.randomUUID`, CSS features, native `<dialog>`, framework router, etc.)
2. **Compatibility** — Does it support our framework/runtime versions (React major, Node version,
   ESM, SSR/RSC)? Check its peer dependencies.
3. **Cost** — Bundle size (check bundlephobia/pkg-size), runtime cost, and whether it can be
   lazy-loaded or kept server-side.
4. **Health** — Maintained in the last ~12 months, widely used, permissive license, no known
   critical advisories.

Rules:
- One library per job. Never install two animation, state, form, date, or UI-kit libraries.
- Use a single package manager per project (whatever the lockfile says); commit the lockfile.
- Pin via the lockfile; do not use `latest` tags in scripts or CDN URLs.
- Heavy client libraries (three, gsap plugins, chart libs, editors) are dynamically imported on
  the routes that need them.
- Run `npm audit` / `pnpm audit` before the final submission; fix high/critical issues where
  feasible.
- Remove unused dependencies before submission.
