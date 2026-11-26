---
name: demo-presentation
description: Prepares the final hackathon pitch and live demo - problem hook, solution story, product walkthrough script, feature demonstration order, architecture explanation, innovation highlights, real-world impact, closing pitch, judge Q&A preparation, slide outline, backup video and rehearsal plan. Use when preparing slides, a demo script, a pitch, a README for judges, or rehearsing the final presentation.
---

# Hackathon Presentation & Demo

Judges see ~10 demos in a row. Ours must be **clear in 30 seconds, convincing in 3 minutes,
memorable afterwards**. Fill `docs/project/14-presentation-plan.md` (template in
`docs/templates/14-presentation-plan.md`).

## Narrative arc (adapt timings to the allowed slot; default 5 min + Q&A)
| Time | Beat | Content |
|---|---|---|
| 0:00–0:30 | **Hook** | A concrete person + moment of pain from the brief ("It's week 9. Sara has failed two quizzes and nobody knows yet.") |
| 0:30–1:00 | **Problem & root cause** | Why it happens today; the insight we found |
| 1:00–1:20 | **Solution in one sentence** | Product name + value proposition |
| 1:20–3:50 | **Live demo** | The main user journey end-to-end, then the "wow" feature |
| 3:50–4:30 | **How it's built** | One architecture diagram; 2–3 technical decisions judges will respect (data integrity, security/RLS, real-time, performance) |
| 4:30–5:00 | **Impact & close** | Who benefits, measurable expected outcome, what's next; memorable closing line |

## Demo script rules
- Follow a **story**, not a feature tour: one persona completing a real task, then a second role
  reacting (e.g. student submits → admin approves → student notified).
- Show the differentiator by minute 3 at the latest.
- Pre-logged-in tabs per role, seeded data prepared for each step, browser zoom ~110–125%,
  notifications off, bookmarks bar hidden, dark/light mode chosen for the projector.
- Narrate outcomes, not clicks ("she sees immediately which three students need attention").
- Never type long text live — use prefilled or pasted values.
- Have a **reset script** to restore demo data between rehearsals.

## Slides (6–8 max)
1. Title + one-line value proposition
2. Problem (human story + one real fact from the brief)
3. Insight / root cause
4. Solution overview (product shot)
5. → Live demo (switch)
6. Architecture (clean diagram: client → API → DB → services; highlight key decisions)
7. Impact + roadmap
8. Team + thank you + link/QR
Same visual identity as the product. Large type, one idea per slide, no paragraphs.

## Judge Q&A prep — prepare 2-sentence answers for
- Why this approach over alternatives? · How does it scale to the whole university/company?
- How do you handle security/privacy? · What's real vs mocked? (answer honestly)
- What was the hardest technical challenge? · What would you build next with more time?
- How would users adopt it / how is it different from existing tools?

## Risk management
- Backup: recorded demo video (1080p, ≤ 3 min) + screenshots in the slides.
- Local build ready in case the network fails; deployed URL tested on a different network.
- Laptop charged, adapters (HDMI/USB-C) tested, display mirroring checked.

## Rehearsal
At least 3 timed run-throughs; assign speaker roles; cut anything over time; record one and watch
it critically. The `competition-strategist` agent can critique the script from a judge's view.
