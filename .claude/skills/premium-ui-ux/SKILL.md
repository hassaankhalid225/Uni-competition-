---
name: premium-ui-ux
description: Premium, human-designer-quality UI/UX for web apps and sites - creative direction, custom design systems and tokens, typography, colour, spacing, layout grids, visual hierarchy, SaaS dashboards, editorial layouts, components, micro-interactions, accessibility and screenshot-based visual review. Use when defining the look of a product, building or restyling any interface, or reviewing whether a UI looks professional rather than AI-generated.
---

# Premium UI/UX & Creative Development

Target: an interface a senior product designer would sign. Every visual decision has a reason.
References: `references/design-system.md` (tokens & scales),
`references/visual-review.md` (critique checklist & AI-template tells).

## 1. Creative direction first (before any component)
Write in `docs/project/05-ui-ux-plan.md`:
- **Audience & context** — who, which device, how often, under what stress.
- **Personality** — 3 adjectives (e.g. *calm, precise, trustworthy* for healthcare;
  *energetic, social, bold* for events). Everything else derives from these.
- **Reference board** — 3–5 real products/sites with a note on *what* to borrow (layout rhythm,
  type, data density), never copy wholesale. Good sources: Linear, Stripe, Vercel, Notion,
  Arc, Raycast, Cron/Notion Calendar, Mercury, Awwwards/Godly/Siteinspire for marketing pages.
- **Concept** — one sentence visual idea tied to the product (e.g. "a calm control room":
  dark neutral canvas, one signal colour for things needing action).

## 2. Design system
Define tokens before building screens (see reference): colour roles (not raw colours), type
scale, spacing scale, radii, elevation, motion durations/easing, breakpoints. Implement as CSS
variables / Tailwind v4 `@theme`, consumed by shadcn/ui components that we restyle.

### Typography
- Max 2 families: one expressive display face (headings, hero) + one highly legible text face
  (UI, body), or a single variable family with weight contrast. Good free choices: Inter Tight /
  Geist / Manrope / Instrument Sans (UI); Instrument Serif / Fraunces / Playfair (editorial
  display); JetBrains Mono / Geist Mono (data, code).
- Modular scale (1.2 for dense apps, 1.25–1.333 for marketing). Body 15–16px app, 17–18px
  marketing. Line length 60–75ch. Headings: tighter leading (1.05–1.2) and slight negative
  tracking at large sizes. Tabular numbers (`font-variant-numeric: tabular-nums`) in tables/KPIs.

### Colour
- Mostly neutrals (a tinted grey ramp, not pure #000/#fff) + **one** brand/accent colour + semantic
  colours (success, warning, danger, info). Accent used sparingly for primary actions and focus.
- Build ramps in OKLCH for perceptual consistency. Check contrast (≥ 4.5:1 text).
- Dark mode: design it, don't invert it — raise surface lightness for elevation, desaturate accents.

### Space & layout
- 4px base, 8px rhythm. Generous outer whitespace, tight internal grouping (proximity shows
  relationships). 12-column grid for marketing; sidebar + fluid content for apps.
- Align to a few strong edges. Vary section rhythm on marketing pages (full-bleed, split,
  asymmetric, editorial) instead of repeating centred stacks.

## 3. Product UI (dashboards, management apps)
- Information density appropriate to experts: compact tables, clear column alignment (numbers
  right, text left), sticky headers, muted borders, row hover.
- Hierarchy: page title → primary action → filters → content. One primary button per view.
- Status as readable badges (colour + text, never colour alone).
- KPI cards only for numbers that drive a decision; include context (period, comparison).
- Empty states teach: what this area is, why empty, the one action to start.
- Keyboard: ⌘K command palette, `/` to search, Esc to close — cheap and impressive.

## 4. Micro-interactions
Button press (scale 0.98), hover elevation, focus rings, optimistic toggles, skeletons that match
layout, toast confirmations with undo, smooth list insert/remove, inline success ticks.
150–250ms, ease-out. See `motion-design`.

## 5. Glassmorphism, gradients, glow — rules
Allowed only with intent: glass for overlays on rich imagery/3D (with sufficient blur + contrast
backing), a single subtle gradient as brand signature, glow only to indicate live/active state.
Never as default decoration.

## 6. Accessibility (non-negotiable)
WCAG 2.2 AA contrast, visible focus, semantic landmarks, labels, 44×44px touch targets on mobile,
reduced-motion support, no information by colour alone, alt text, form errors announced
(`aria-describedby`, `aria-live`). Test with keyboard only and with axe.

## 7. Visual review loop (mandatory)
1. Capture screenshots with Playwright at 390, 768, 1440 widths (light + dark if supported).
2. Look at them. Critique with `references/visual-review.md`.
3. Fix the top 5 issues; repeat once more for key screens (landing hero, role home, main list,
   main form).
Never declare a UI "premium" without this loop.
