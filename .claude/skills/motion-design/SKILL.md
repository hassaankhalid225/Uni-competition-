---
name: motion-design
description: Professional web motion with GSAP (timelines, ScrollTrigger, SplitText, Flip), Motion for React (formerly Framer Motion), Lenis smooth scrolling, page/route transitions, animated typography, scroll storytelling, hover and micro-interactions, loading sequences and 3D motion - with reduced-motion accessibility and performance. Use when adding or reviewing any animation, transition or scroll effect.
---

# Advanced Motion Design

Motion must **explain** (where things come from/go, what changed, what to look at) or
**reward** (feedback, delight at key moments). Otherwise remove it.

## Tool choice (one per job)
| Need | Tool |
|---|---|
| React component enter/exit, layout animations, gestures, shared elements | **Motion** (`motion/react`) |
| Complex timelines, scroll-scrubbed storytelling, pinning, text splitting | **GSAP** + ScrollTrigger (+ SplitText, Flip). GSAP and all its plugins are free to use. In React use `@gsap/react` `useGSAP()` for automatic cleanup |
| Smooth scrolling | **Lenis** (`lenis`), synced with ScrollTrigger |
| Simple hover/focus/state changes | CSS transitions |
| Scroll-linked effects without JS (progressive) | CSS scroll-driven animations (`animation-timeline: view()`) where supported |
| 3D object animation | R3F `useFrame`, drei helpers, or GSAP tweening Three.js values |
| Route transitions (Next.js) | View Transitions API / Motion `AnimatePresence` in a template |

Do not mix Motion and GSAP on the same element.

## Timing & easing
- Micro 120–200ms · UI panels 250–400ms · storytelling 600–1200ms.
- Enter: ease-out (`power3.out`, `cubic-bezier(0.22,1,0.36,1)`); exit faster than enter.
- Stagger 30–80ms for lists; cap total stagger < 600ms.
- Springs (Motion): `{ type: "spring", stiffness: 300, damping: 30 }` for UI; bouncier only for
  playful brands.

## Patterns
**Lenis + ScrollTrigger sync**
```ts
const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```
**Pinned scroll story** — pin a section, scrub a timeline across N viewport heights; each step
reveals one idea. Keep ≤ 3–4 steps; provide a static layout on mobile if it feels long.
**Text reveal** — SplitText by lines/words, mask with `overflow: hidden`, translate `yPercent`
100 → 0 with stagger; revert splits on cleanup (accessibility: keep `aria-label` on parent).
**Shared-element transition** — Motion `layoutId` from list card to detail panel.
**Loading** — skeletons for data; a brand intro loader only if assets truly need it, < 1.5s,
skippable, never on repeat visits.

## Accessibility
```ts
const mm = gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)', () => { /* full motion */ });
mm.add('(prefers-reduced-motion: reduce)', () => { /* instant states / simple fades */ });
```
Motion: `useReducedMotion()` or `<MotionConfig reducedMotion="user">`. Disable smooth scroll and
parallax under reduced motion. Nothing essential may depend on animation completing.

## Performance
- Animate only `transform` and `opacity` (and `filter` sparingly). Never `top/left/width/height`.
- `will-change` only during the animation. Avoid animating large blurred/backdrop-filter layers.
- Kill ScrollTriggers and timelines on unmount (`useGSAP` does this). Call
  `ScrollTrigger.refresh()` after fonts/images load.
- Verify 60fps in Chrome DevTools Performance panel with 4× CPU throttle on key pages.

## Review questions
What does this animation communicate? Is it faster than it feels necessary? Does it work with
reduced motion? Does it ever block reading or input? If any answer is bad — simplify or delete.
