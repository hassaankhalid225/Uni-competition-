# Design System Starter (tokens & scales)

Values below are **structure**, not a fixed brand. Re-pick hues, fonts and radii per project
from the creative direction.

## Tailwind v4 token skeleton (`src/app/globals.css`)
```css
@import "tailwindcss";

@theme {
  /* Typography */
  --font-sans: "Geist", ui-sans-serif, system-ui, sans-serif;     /* swap per project */
  --font-display: "Instrument Serif", ui-serif, Georgia, serif;   /* optional */
  --font-mono: "Geist Mono", ui-monospace, monospace;

  /* Type scale (1.25) */
  --text-xs: 0.75rem;  --text-sm: 0.875rem; --text-base: 1rem;
  --text-lg: 1.25rem;  --text-xl: 1.563rem; --text-2xl: 1.953rem;
  --text-3xl: 2.441rem; --text-4xl: 3.052rem; --text-5xl: clamp(3rem, 6vw, 4.768rem);

  /* Radii & motion */
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}

/* Semantic colour roles (OKLCH). Components use roles, never raw hues. */
:root {
  --bg: oklch(0.985 0.003 250);
  --surface: oklch(1 0 0);
  --surface-2: oklch(0.965 0.004 250);
  --border: oklch(0.91 0.006 250);
  --text: oklch(0.22 0.015 250);
  --text-muted: oklch(0.50 0.015 250);
  --accent: oklch(0.58 0.17 255);        /* the ONE brand accent */
  --accent-fg: oklch(0.99 0 0);
  --success: oklch(0.62 0.14 155);
  --warning: oklch(0.75 0.15 75);
  --danger: oklch(0.58 0.2 25);
  --focus: var(--accent);
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: oklch(0.16 0.01 250);
    --surface: oklch(0.2 0.012 250);
    --surface-2: oklch(0.24 0.012 250);
    --border: oklch(0.3 0.012 250);
    --text: oklch(0.95 0.005 250);
    --text-muted: oklch(0.7 0.01 250);
    --accent: oklch(0.7 0.15 255);
  }
}
```
(If using shadcn/ui, map these roles onto its variables: `--background`, `--foreground`,
`--primary`, `--muted`, `--border`, `--ring`, etc.)

## Spacing scale (4px base)
4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128. Component padding 12–24, section padding 64–128
(marketing) / 24–32 (app).

## Elevation
0 flat (default) · 1 hairline border · 2 soft shadow for popovers
(`0 8px 24px -8px rgb(0 0 0 / .12)`) · 3 modal. Prefer borders *or* shadows, not both.

## Breakpoints
sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536. Test at 390 / 768 / 1440.

## Motion tokens
Durations: 120ms (micro), 200ms (UI), 350ms (panels), 600–900ms (hero/storytelling).
Easing: `--ease-out` for entering, `--ease-in-out` for moving, linear only for scrubbed scroll.

## Component inventory to restyle (shadcn/ui)
Button (primary/secondary/ghost/destructive, sizes, loading), Input, Select, Combobox, Textarea,
Checkbox, Switch, Dialog, Sheet/Drawer, Dropdown, Tabs, Table, Badge, Toast (sonner), Tooltip,
Card, Avatar, Skeleton, Command (⌘K), Calendar/Date picker, Breadcrumb, Pagination.
