# Hackathon Development Toolkit

A reusable, Claude Code–powered environment for taking an **unknown hackathon problem statement**
to a working, polished, well-presented product — fast and without cutting corners.

> **Status:** toolkit ready. No application has been built yet — development starts only after
> the official problem statement is provided (see [`brief/`](brief/README.md)).

## What's inside

```
CLAUDE.md                      Project memory: mission, activation protocol, map of the toolkit
.claude/
  settings.json                Shared permissions (secrets read-denied)
  rules/                       Always-on & path-scoped standards
  skills/                      12 task playbooks (auto-loaded by description or /skill-name)
  agents/                      9 specialised subagents
brief/                         Drop the official problem statement PDF here
docs/
  templates/                   14 blank planning templates (copied to docs/project/ at kickoff)
  playbook/                    Toolkit guide, time strategy, team roles
scripts/verify-toolkit.mjs     Structural validation of skills, agents, rules and links
```

## Quick start (on challenge day)

1. Put the PDF in `brief/`.
2. Open Claude Code in this folder and run `/hackathon-kickoff brief/<file>.pdf`.
3. Answer the questions at Gate A (solution choice) and Gate B (stack + MVP scope).
4. Follow the 12-stage workflow; see [`docs/playbook/toolkit-guide.md`](docs/playbook/toolkit-guide.md).

## Verify the toolkit

```bash
node scripts/verify-toolkit.mjs
```

No dependencies required (Node ≥ 18).
