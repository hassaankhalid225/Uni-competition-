# Team Roles & Collaboration (humans + Claude)

Adjust to team size. One person can hold several roles; every role must have an owner.

| Role | Owns | Pairs with agent |
|---|---|---|
| Product lead / pitcher | Problem analysis decisions, scope cuts, presentation | `problem-analyst`, `competition-strategist` |
| Tech lead | Architecture, integration, merges, deploy | `software-architect`, `database-architect` |
| Frontend / design | Design system, screens, motion, 3D | `creative-director`, `frontend-developer`, `3d-experience` |
| Backend | APIs, auth, business rules, seeds | `backend-developer`, `database-architect` |
| QA / demo owner | Test passes, demo data, rehearsal logistics | `qa-tester` |

## Collaboration rules
- Decisions recorded in `docs/project/` — if it is not written there, it is not decided.
- Contract-first: API spec agreed before frontend/backend split.
- Pull/merge at least hourly; small commits; announce schema changes to everyone.
- Stand-up every ~3 hours (5 minutes): done, next, blocked, time check vs. plan.
- One person owns the final integration and the deployed demo build.
