# Time-Constrained Development Strategy

Golden rule: **a polished, fully working MVP beats a large, incomplete system.** Always keep a
committed, demoable build.

## Phase budgets (percent of total event time)

| Phase | % | 6 h | 12 h | 24 h | 48 h |
|---|---|---|---|---|---|
| 1. Read brief, analyse, choose solution (Gate A) | 8% | 30m | 1h | 2h | 4h |
| 2. Plan: MVP, architecture, design direction (Gate B) | 7% | 25m | 50m | 1.5h | 3h |
| 3. Scaffold, auth, schema, tokens, app shell, first deploy | 10% | 35m | 1.2h | 2.5h | 5h |
| 4. Must-have vertical slices | 35% | 2h | 4.2h | 8.5h | 17h |
| 5. Integration + critical-flow testing | 10% | 35m | 1.2h | 2.5h | 5h |
| ── **Feature freeze** ── | | | | | |
| 6. Visual polish, landing page, motion/3D (if justified) | 15% | 55m | 1.8h | 3.5h | 7h |
| 7. Regression, deploy verification, demo prep, rehearsal | 15% | 55m | 1.8h | 3.5h | 7h |

For events ≥ 24h, schedule sleep in shifts — tired teams ship bugs. Short events (≤ 6h): skip 3D
unless it *is* the product; use the default stack with no experiments.

## Checkpoints
- **End of phase 1:** solution chosen, ambiguities resolved.
- **End of phase 3:** deployed "hello" app with login works → environment risk eliminated.
- **50% time:** first Must flow works end-to-end; run `competition-strategist` review.
- **Feature freeze:** all Musts work end-to-end. Unfinished Shoulds are cut or hidden.
- **T-15%:** demo script exists; backup video recorded at T-5%.

## When behind schedule (in order)
1. Cut Could features, then Shoulds.
2. Replace custom components with stock shadcn/ui (restyled via tokens).
3. Replace live 3D with a designed static/2D visual or a short video loop.
4. Replace a complex integration with a clearly labelled simulated step (be honest in the demo).
5. Never cut: the core flow, data integrity, the demo path's error handling.

## Parallel work with agents
- After Gate B: `database-architect` (schema+seed) ‖ `creative-director` (design system) ‖
  `software-architect` finalises the API contract.
- Build phase: `backend-developer` ‖ `frontend-developer` per slice, against the contract.
- After each slice: `qa-tester`. At 50% and freeze: `competition-strategist`.
The main session integrates, resolves conflicts and owns final decisions. Avoid two agents
editing the same files at once (use worktree isolation or split by folder).
