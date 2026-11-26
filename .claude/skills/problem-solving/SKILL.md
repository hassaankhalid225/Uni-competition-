---
name: problem-solving
description: Rigorous problem analysis and solution design for a hackathon brief - extracting functional and non-functional requirements, constraints and judging criteria, finding the real users, pain points and root cause, generating and scoring alternative solutions, defining the MVP and roadmap. Use whenever a problem statement, challenge PDF, or requirements document is provided, or when choosing between solution approaches.
---

# Problem Solving & Product Architecture

Goal: solve the **actual** problem in the brief better than 9 other teams — not build the most
generic software that superficially matches its keywords. Output goes into
`docs/project/01-problem-analysis.md` (template: `docs/templates/01-problem-analysis.md`).

## The 17-step process

### Understand (steps 1–8)
1. **Read everything.** Every page, table and annex. Note page numbers.
2. **Restate the problem** in one sentence, in plain words, without naming a solution.
   Bad: "Build a student management system". Good: "Advisors cannot see which students are at
   risk of failing until it is too late to intervene."
3. **Target users** — list every role (primary user, admin, approver, viewer, external party).
   For each: goal, context (device, frequency, skill level), what they do today.
4. **Pain points** — concrete, observable frustrations per role, ranked by severity × frequency.
5. **Root cause** — ask "why?" until you hit something a product can change (5 Whys). Classify:
   information gap, coordination gap, manual/repetitive work, lack of visibility, access/trust,
   decision difficulty. The solution must target this, not the symptom.
6. **Functional requirements** — every "must/should/shall/able to" in the brief, quoted, with an
   ID (`FR-01`) and page ref. Add *implied* requirements separately (`FR-I-01`) and mark them.
7. **Non-functional requirements** — performance, security, privacy, accessibility, scale,
   usability, platform/device, language, offline, availability (`NFR-01`…).
8. **Constraints & evaluation** — mandated tech, data sources, time, team size, submission format,
   demo length, and **judging criteria with weights**. Judging criteria drive every later choice.

Then list **ambiguities** with a proposed default for each, and flag which ones block scope.

### Explore (steps 9–12)
9. **Generate 3–4 distinct concepts.** Force diversity using different levers:
   - *Workflow* — digitise and streamline the core process end-to-end.
   - *Insight* — data/visibility layer: dashboards, alerts, predictions.
   - *Automation* — remove manual steps (rules engine, scheduling, notifications, AI only if it
     genuinely helps).
   - *Experience* — radically simpler or more engaging interface for the key user.
10. **Compare** each concept: root-cause fit, coverage of FRs, wow factor, risk, effort.
11. **Feasibility** — can a team of N build the Must-haves in T hours with known tech? Identify
    the riskiest technical unknown and how to de-risk it in the first 10% of time (spike).
12. **Select** using the weighted matrix (below). Combine strengths when cheap (e.g. Workflow
    core + one Insight feature as the differentiator).

### Define (steps 13–17)
13. **MVP** — the smallest set of features that solves the root problem end-to-end for the primary
    user and satisfies every mandatory requirement. Write it as 3–6 user stories with acceptance
    criteria.
14. **Innovation** — 1–2 features that make judges remember us. Must connect directly to the
    root cause (see `product-strategy`).
15. **System architecture** — hand off to `fullstack-engineering`; record modules, data entities
    and integrations.
16. **Roadmap** — ordered vertical slices with time estimates; first slice demoable early.
17. **Prioritise by time** — MoSCoW; anything not fitting into 70% of available build time moves
    down a tier.

## Weighted decision matrix

Use official judging weights if provided; otherwise the defaults below. Score 1–5.

| Criterion | Default weight |
|---|---|
| Solves the root problem / relevance | 25% |
| Innovation & originality | 20% |
| Technical feasibility in the time | 20% |
| User experience & demo impact | 20% |
| Completeness vs. stated requirements | 15% |

Show the matrix in the analysis. A concept with feasibility ≤ 2 is rejected regardless of score.

## Requirement traceability
Every feature in the plan references an `FR`/`NFR` ID, a pain point, or a judging criterion.
Features with no reference are cut or moved to "Could".

## Anti-patterns
- Jumping to a tech stack before understanding users.
- Building every module a "management system" usually has instead of what the brief needs.
- Adding AI because it is trendy. Use AI only when it solves a real step better than rules.
- Treating assumptions as facts. Ask when they change scope.
- Over-engineering (microservices, Kubernetes, multiple DBs) for a 24-hour build.

## Output checklist
- [ ] Problem statement in one sentence + root cause
- [ ] Users & pain points table
- [ ] FR / NFR / constraints with IDs and page refs
- [ ] Judging criteria + weights
- [ ] Ambiguities with defaults; blocking ones raised to the team
- [ ] 3–4 concepts + scored matrix + recommendation
- [ ] MVP user stories + acceptance criteria
- [ ] Innovation features with justification
- [ ] Riskiest unknown + de-risk spike
