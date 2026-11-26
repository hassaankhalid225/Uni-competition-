---
name: hackathon-kickoff
description: Orchestrates the full 12-stage hackathon workflow from an official problem statement (usually a PDF) to a working, demo-ready product. Use when the team provides or uploads the hackathon problem statement/brief/challenge PDF, says "the challenge is out", or asks to start the actual project. Never use to build anything without a real brief.
argument-hint: "[path-to-problem-statement.pdf]"
---

# Hackathon Kickoff — 12-Stage Execution Workflow

You are the lead of a senior product team. The brief is the single source of truth. Move fast,
but never skip understanding. Gate checks (🛑) require the team's confirmation.

Input: `$ARGUMENTS` (path to the brief). If empty, look in `brief/` for a PDF/DOCX/MD; if none,
ask the team to provide it and stop.

## Stage 0 — Setup (2 min)
- `mkdir -p docs/project` and copy the templates you will need from `docs/templates/`
  (at minimum 01, 02, 03, 04, 05, 09). Ask for (or infer from the brief) **total time available,
  team size, submission format, and demo length**. Record them in section 1 ("Event facts") of
  `docs/project/01-problem-analysis.md`.

## Stage 1 — Document analysis
- `pdfinfo <file>` → page count. Extract all text: `pdftotext -layout <file> -`.
  If output is empty/garbled, it is scanned: read pages with the Read tool (`pages: "1-20"`).
- Read **every** page including annexes, rubrics, sample data and footnotes.
- Extract verbatim, with page refs: objectives, functional requirements, constraints
  (tech, data, platform, time), deliverables, submission rules, **judging criteria and weights**.
- Use the `problem-solving` skill for the extraction method.

## Stage 2 — Problem understanding
Root problem, target users + their pain points, root causes, expected outcomes, success metrics.

## Stage 3 — Solution research
Generate 3–4 genuinely different solution concepts (not variations of one). For each:
core idea, how it solves the root cause, key features, wow factor, effort, risk.

## Stage 4 — Solution selection
Score with the weighted matrix in `problem-solving` (weights = official judging criteria when
given). Recommend one, explain why the others lose.
🛑 **Gate A**: present the analysis summary, options and recommendation, plus a numbered list of
ambiguities/questions. Wait for the team's decision.

## Stage 5 — Product planning
Fill `docs/project/02-product-plan.md` and `03-feature-prioritization.md`: name, one-line value
proposition, target users, MVP (Musts only), USP, Should/Could features, explicit Won'ts.
Apply the `product-strategy` skill to sanity-check against judging criteria.

## Stage 6 — Architecture planning
Use the `fullstack-engineering` skill (and `management-systems` if relevant). Fill
`04-system-architecture.md`, `06-database-design.md`, `07-api-spec.md`: stack + rationale,
modules, data model, API surface, auth/roles, integrations, deployment, demo-safety plan
(seed data, offline fallback).
🛑 **Gate B**: confirm stack + MVP scope with the team (one short message).

## Stage 7 — Creative direction
Use `premium-ui-ux` (+ `landing-page`, `motion-design`, `3d-web` only if they add value).
Fill `05-ui-ux-plan.md` and `08-design-system.md` (+ `10-3d-asset-plan.md` if 3D is used).

## Stage 8 — Implementation
- Scaffold with the chosen stack (official CLI), commit immediately.
- Build design tokens + layout shell + auth first, then **vertical slices** for each Must-have
  flow (DB → API → UI → states). Commit after each slice.
- Parallelise with agents where work is independent (e.g. `backend-developer` on API while
  `frontend-developer` builds UI against the agreed contract). The main session integrates.
- Track tasks in `docs/project/09-dev-tasks.md`; apply `11-dev-checklist.md` (definition of done)
  to every slice.

## Stage 9 — Integration
Wire real API calls, auth, seeds, external services. Remove all mocks from demo paths (or
label clearly). Verify env vars documented in `.env.example`.

## Stage 10 — Testing
Use `testing-qa` (or the `qa-tester` agent): critical flows E2E, role permissions, validation,
error states, responsive screenshots at 390/768/1440, accessibility, performance. Fill
`12-testing-checklist.md` with real results.

## Stage 11 — Optimisation
Fix bugs by severity, run the `premium-ui-ux` visual review on screenshots, optimise
performance (Lighthouse), remove unused code/deps, `npm audit`. Feature freeze applies.

## Stage 12 — Competition preparation
Use `demo-presentation` (+ `competition-strategist` agent for a judge's-eye critique). Deploy,
verify on a clean browser, fill `13-deployment-checklist.md` and `14-presentation-plan.md`,
record a backup demo video, rehearse with a timer.

## Throughout
- Follow `.claude/rules/time-management.md` — re-check the time budget at each stage.
- Keep `docs/project/` current; it is the memory shared by sessions and agents.
- Report progress honestly: what is done, verified, broken, and next.
