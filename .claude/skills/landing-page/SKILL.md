---
name: landing-page
description: Strategy and structure for a product landing page with its own visual identity and storytelling - hero messaging, problem/solution narrative, features, how-it-works, product preview, interactive demos, use cases, CTAs, footer - plus optional 3D and scroll-driven motion. Use only after the product is defined from the official brief, when planning or building the public-facing landing/marketing page.
---

# Landing Page Framework

A hackathon landing page has one job: make judges understand the product's value in
**5 seconds** and want to see the app. It should feel like a real product launch, unique to this
product — never a template.

## 1. Message first (write before designing)
- **Headline** (≤ 10 words): the outcome for the user, in their language. Specific > clever.
  Test: could a competitor's product use the same headline? If yes, rewrite.
- **Subheadline** (1–2 lines): who it's for + how it works.
- **Primary CTA**: the next real action ("Open the dashboard", "Try the demo as an admin").
- **Proof**: real evidence only — a live product preview, a real metric from our own seed data
  clearly labelled, the problem statement's own facts.

## 2. Story structure (choose & reorder per product — not all sections are required)
1. **Hero** — headline, sub, CTA, and a visual that *shows the product or its concept*
   (product screenshot/video in a framed device, interactive 3D metaphor, or live mini-demo).
2. **Problem** — the pain in the users' words; a concrete scenario, not generic statistics.
3. **Solution / how it works** — 3–4 steps tied to the actual workflow; animate the flow.
4. **Features** — grouped by user benefit; show real UI crops, not icon grids.
5. **Product preview / interactive demo** — scroll-driven walkthrough or embedded live widget.
6. **Use cases / roles** — tabs per user role showing their view.
7. **Impact** — honest expected outcomes (time saved, errors prevented) with reasoning.
8. **CTA** — repeat the primary action.
9. **Footer** — team, hackathon, links, minimal.

## 3. Unique identity recipes (pick one direction per project)
- **Editorial** — large serif display type, asymmetric grid, generous whitespace, restrained colour.
- **Product-led** — the app UI is the hero; dark canvas, precise grid, crisp screenshots.
- **Immersive 3D** — a scene that embodies the concept (campus model, data flowing between
  nodes, objects assembling) with scroll-driven camera; content overlays stay readable.
- **Playful / bold** — saturated palette, oversized type, sticker-like shapes, springy motion
  (for student/social/event products).

## 4. Motion & 3D (see `motion-design`, `3d-web`)
- One signature moment (hero reveal or scroll story), quieter elsewhere.
- Text readable immediately — never block the headline behind a long intro animation or loader.
- Lazy-load 3D below or behind the fold content; provide a static poster/fallback.

## 5. Technical checklist
- [ ] LCP < 2.5s on a mid laptop; hero text is HTML (not canvas/image)
- [ ] Works at 390px; tap targets 44px; no horizontal overflow
- [ ] `prefers-reduced-motion` respected; 3D has a static fallback
- [ ] Meta title/description, Open Graph image, favicon
- [ ] Every CTA leads somewhere real (login, demo account, app)
- [ ] Copy proofread; no fake claims
