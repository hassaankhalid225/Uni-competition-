# Hackathon Time Discipline

Priority order whenever choosing what to do next:
1. Understand the challenge → 2. Core functionality → 3. Required architecture →
4. Essential UX → 5. Integration → 6. Test critical flows → 7. Visual polish → 8. Demo prep.

- Classify every feature as **Must / Should / Could / Won't** (MoSCoW) in
  `docs/project/03-feature-prioritization.md`. Build all Musts end-to-end before any Should.
- Build in **vertical slices** (UI + API + DB for one flow) so something demoable exists early.
- Keep a working, committed build at all times; tag good states (`demo-v1`, `demo-v2`).
- Timebox: if a task exceeds 2× its estimate, stop, re-plan, and pick the simpler path.
- No decorative animation or 3D work while a Must-have flow is broken or missing.
- **Feature freeze** at ~80% of the time budget: after that only bug fixes, polish, and demo prep.
- Reserve the final ~10% for rehearsal, deploy verification and a backup (local build / video).

See `docs/playbook/time-strategy.md` for time budgets for 6h, 12h, 24h and 48h events.
