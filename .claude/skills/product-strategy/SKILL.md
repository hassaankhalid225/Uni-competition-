---
name: product-strategy
description: Evaluates a hackathon product from the judges' perspective - innovation, originality, problem relevance, real-world usefulness, technical depth, feasibility, UX, scalability and demo impact - and finds differentiators versus competing teams. Use when choosing features, deciding what to cut, defining the USP, reviewing the product mid-build, or before the final demo.
---

# Product Strategy & Competitive Advantage

~10 teams get the same brief. Most will build the obvious solution: login → CRUD tables →
a dashboard with charts. We win by solving the real problem more convincingly and showing it
in a way judges remember.

## 1. Predict the field
Write down what the "average team" will build for this brief (the obvious feature list and
look). That is the baseline to beat. Our product must be clearly better on at least **two**
axes: depth of problem understanding, a distinctive core interaction, completeness/reliability,
visual quality, or a believable real-world story.

## 2. Judge scorecard (score 1–5, be harsh)

| Axis | Question a judge asks |
|---|---|
| Problem relevance | Does this directly solve the problem in the brief? |
| Innovation | Is there an idea here I haven't seen today? |
| Real-world usefulness | Would the actual users adopt this tomorrow? |
| Technical implementation | Is it real (DB, auth, logic) or a clickable mock? |
| Feasibility / scalability | Could it run for a whole university / company? |
| UX & design | Is it effortless and does it look professional? |
| Completeness | Do the flows work end-to-end with no dead buttons? |
| Presentation | Was the story clear in the first 30 seconds? |

Use official criteria and weights if the brief provides them. Any axis ≤ 2 is the next priority.

## 3. Differentiation levers (pick 1–2, tied to the root cause)
- **Insight over storage** — surface what users need to *act on* (at-risk items, conflicts,
  deadlines, anomalies) instead of just listing records.
- **Closing the loop** — notifications, approvals, reminders so the process actually completes.
- **Smart defaults / automation** — auto-scheduling, conflict detection, auto-categorisation,
  suggested actions. Rules first; AI only where it clearly outperforms rules.
- **Role-perfect views** — each role sees a purpose-built home screen, not one generic dashboard.
- **Trust & transparency** — audit trail, status timeline, explainable decisions.
- **Exceptional core interaction** — the one action users do most is delightful and fast
  (command palette, drag-and-drop, one-click approve, keyboard shortcuts).
- **Signature visual moment** — a hero 3D/motion piece that *explains* the product concept.

## 4. Feature filter
For each proposed feature ask:
1. Which requirement, pain point, or judging criterion does it serve? (none → cut)
2. Will it be visible in the demo? (no → lower priority unless mandatory)
3. Can it be done fully in the time? (half-done features hurt more than missing ones)
4. Does it add risk to the core flow? (yes → isolate or defer)

## 5. Anti-patterns
- Artificial complexity (blockchain, microservices, "AI" chat bolted on) to look advanced.
- Fake metrics or testimonials — judges notice and it destroys credibility.
- Ten shallow modules instead of three deep ones.
- A beautiful landing page in front of a broken app.

## 6. Mid-build and pre-demo review
Run the scorecard at ~50% time and again at feature freeze. Output: top 3 weaknesses, top 3
cheap improvements (≤ 1 hour each), and anything to cut or hide. Record in
`docs/project/02-product-plan.md` under "Strategy review".
