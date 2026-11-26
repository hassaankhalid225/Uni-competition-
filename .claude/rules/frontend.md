---
paths:
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/*.vue"
  - "**/*.svelte"
  - "**/*.css"
  - "**/components/**"
  - "**/app/**"
  - "**/pages/**"
---

# Frontend Rules

- **Responsive by default**: design at 390px, 768px, 1280px and 1440px+. No horizontal scroll at
  any width. Use fluid type (`clamp()`) and container-aware layouts.
- **Accessibility (WCAG 2.2 AA)**: semantic HTML first (`button`, `nav`, `main`, `label`, `table`);
  visible focus rings; text contrast ≥ 4.5:1 (3:1 for large text/UI); every input has a label;
  icons-only buttons have `aria-label`; modals trap focus and close on `Esc`; full keyboard use.
- **Motion**: every animation respects `prefers-reduced-motion`. Never animate layout properties
  (`width`, `height`, `top`, `left`) when `transform`/`opacity` will do.
- **States**: every data view has loading (skeleton that matches layout), empty (helpful message +
  primary action), error (what happened + retry), and success feedback.
- **Forms**: schema validation (shared with server), inline errors next to fields, disabled +
  pending state on submit, no data loss on error.
- **Design tokens only**: colours, spacing, radii, shadows and type come from the design system
  (CSS variables / Tailwind theme). No ad-hoc hex values or random pixel spacing in components.
- **Performance**: images via the framework image component or explicit `width`/`height` +
  modern formats (AVIF/WebP) + lazy loading below the fold; fonts self-hosted with
  `font-display: swap`; heavy libraries (3D, charts, GSAP plugins) dynamically imported.
- **Components**: small, reusable, typed props; no business logic or DB calls in presentational
  components; colocate component-specific styles and tests.
- **Server/client boundaries** (Next.js App Router): default to Server Components; add
  `"use client"` only for interactivity; never import server-only modules into client files.
