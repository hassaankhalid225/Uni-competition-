# Hackathon Development Toolkit — Project Memory

This repository is a **reusable hackathon toolkit** for a university-level competition (AI University,
~10 teams, one team advances). It holds Claude Code skills, agents, rules, workflows and templates.
It is designed to take an *unknown* problem statement and drive it to a winning, working product.

## Current mode: SETUP COMPLETE — WAITING FOR THE OFFICIAL PROBLEM STATEMENT

- **Do not build any application, website, landing page, dashboard or demo project** until the
  official problem statement (usually a PDF) has been provided, read in full, and analysed.
- Do not invent a problem statement, dummy product, or fake features.
- Do not scaffold an app (`create-next-app`, `vite create`, etc.) or install app dependencies yet.
- Editing the toolkit itself (skills, rules, agents, templates, docs) is allowed.

When the PDF arrives, follow the **activation protocol** below — never skip straight to code.

## Activation protocol (when the problem statement arrives)

1. The PDF is placed in `brief/` (or attached in chat). Run the `/hackathon-kickoff` skill.
2. Read the **entire** document (`pdftotext -layout file.pdf -` or the Read tool with `pages`).
   Record every requirement, constraint, deliverable, deadline and judging criterion.
3. Apply the `problem-solving` skill → write `docs/project/01-problem-analysis.md`.
4. Present 2–4 solution options + a recommendation; **ask the team about real ambiguities**.
5. After the team confirms, produce plan, architecture and creative direction
   (`docs/project/02…06`), then implement in vertical slices.
6. Follow the 12-stage workflow in `.claude/skills/hackathon-kickoff/SKILL.md` and the time
   budget in `docs/playbook/time-strategy.md`.

## Priorities (in order)

1. Best possible problem-solving — solve the *actual* problem in the brief.
2. A strong, practical product concept with a clear reason for every feature.
3. Professional, simple-as-possible architecture.
4. Exceptional, human-quality UI/UX (no generic AI-template look).
5. 3D and motion **only where they add meaning**.
6. A fully working frontend + backend + database — real flows, real data.
7. Verified reliability: tested critical flows, responsive, accessible, fast.
8. A short, memorable, rehearsed demo.

A polished, fully working MVP beats a large, half-finished system. Always keep a demoable build.

## Map of the toolkit

| Path | Purpose |
|---|---|
| `.claude/rules/` | Always-on and path-scoped standards (scope, code quality, security, design, deps, git, honesty) |
| `.claude/skills/` | Task playbooks Claude loads automatically by description, or via `/skill-name` |
| `.claude/agents/` | Specialised subagents (analyst, architect, designer, 3D, frontend, backend, DB, QA, strategist) |
| `.claude/settings.json` | Project permissions (secrets files are read-denied) |
| `docs/templates/` | Blank, reusable planning templates (copy into `docs/project/` per challenge) |
| `docs/playbook/` | Toolkit guide, time strategy, team roles (stack decision guide lives in `fullstack-engineering/references/`) |
| `brief/` | Drop the official problem statement PDF here |
| `scripts/verify-toolkit.mjs` | Validates skill/agent/rule structure and internal links |

### Skills (`.claude/skills/<name>/SKILL.md`)

| Skill | Use when |
|---|---|
| `hackathon-kickoff` | The problem statement arrives — orchestrates all 12 stages |
| `problem-solving` | Analysing a brief, extracting requirements, choosing a solution, defining MVP |
| `product-strategy` | Judging-criteria review, differentiation, feature cuts, competitive edge |
| `fullstack-engineering` | Choosing stack, APIs, auth/RBAC, DB schema, CRUD, dashboards, exports |
| `management-systems` | The challenge is an admin/management/booking/inventory-style system |
| `premium-ui-ux` | Design system, typography, layout, dashboards, visual quality review |
| `landing-page` | Planning/building the product's landing page |
| `motion-design` | GSAP, ScrollTrigger, Motion, Lenis, transitions, micro-interactions |
| `3d-web` | Three.js / React Three Fiber / Drei / GLSL / models / 3D performance |
| `security-reliability` | Auth, validation, secrets, XSS/SQLi, error handling, dependency safety |
| `testing-qa` | Test plans, Vitest/Playwright, API/DB/a11y/perf checks, regression pass |
| `demo-presentation` | Pitch, demo script, architecture slide, Q&A prep, rehearsal |

### Agents (`.claude/agents/`)

`problem-analyst`, `software-architect`, `creative-director`, `3d-experience`,
`frontend-developer`, `backend-developer`, `database-architect`, `qa-tester`,
`competition-strategist`. Use them for focused, parallelisable work; the main session stays the
integrator and owns final decisions.

## Working agreements

- Plans live in `docs/project/` (created at kickoff from `docs/templates/`). Keep them current —
  they are the shared memory between sessions and agents.
- Before adding a dependency, follow `.claude/rules/dependencies.md`.
- Never claim something works or was tested unless it was actually run. Report failures honestly.
- Never commit secrets. `.env*` files are gitignored; only `.env.example` is committed.
- Commit small, working increments; the main branch of the project must always run.
