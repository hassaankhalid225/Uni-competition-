# Toolkit Guide — How to Use This Environment

## How Claude Code loads this toolkit

| Mechanism | Location | When it is used |
|---|---|---|
| Project memory | `CLAUDE.md` | Loaded into every session automatically |
| Rules | `.claude/rules/*.md` | Loaded as project memory. Files with a `paths:` frontmatter (`frontend.md`, `backend-and-database.md`) only apply when Claude works on matching files |
| Skills | `.claude/skills/<name>/SKILL.md` | Claude sees each skill's `description` and loads the full skill automatically when a task matches. You can also invoke one directly: `/hackathon-kickoff brief/challenge.pdf`, `/premium-ui-ux`, etc. Supporting files in `references/` are read on demand |
| Agents | `.claude/agents/<name>.md` | Claude delegates to a subagent when a task matches its description, or when you ask: "Use the problem-analyst agent to analyse the brief". Each runs in its own context and returns a summary. Manage with `/agents` |
| Settings | `.claude/settings.json` | Shared permissions (safe commands allowed; secret files read-denied). Personal overrides go in `.claude/settings.local.json` (gitignored) |

Verify the structure any time: `node scripts/verify-toolkit.mjs`.
Check what loaded in a session: `/memory` (memory + rules), `/agents` (subagents), and ask Claude
"which skills are available?" (it lists every skill name and description it can see).

## Day-of workflow

1. **Drop the brief** into `brief/` (e.g. `brief/challenge.pdf`) or attach it in the chat.
2. Run: `/hackathon-kickoff brief/challenge.pdf` — tell Claude the total hours, team size and
   demo length if the brief doesn't state them.
3. Claude (or the `problem-analyst` agent) produces `docs/project/01-problem-analysis.md` and
   stops at **Gate A** with solution options and questions. Answer the questions; pick a concept.
4. Claude produces the product plan, prioritisation, architecture, DB design and API contract,
   then stops at **Gate B** to confirm stack + MVP scope.
5. Creative direction and design system are written, then implementation begins in vertical
   slices with commits after each.
6. QA, optimisation, deployment and presentation follow the 12 stages in
   `.claude/skills/hackathon-kickoff/SKILL.md`.

## Useful prompts
- "Analyse the brief with the problem-analyst agent, then give me the top 3 concepts."
- "Run the competition-strategist on our current build and list the top 3 one-hour improvements."
- "Use the creative-director agent to review screenshots of the dashboard at 390 and 1440."
- "qa-tester: run the regression pass from the testing-qa skill and report results."
- "Prepare the 5-minute demo script and Q&A answers using the demo-presentation skill."

## Extending the toolkit
- New skill: `.claude/skills/<kebab-name>/SKILL.md` with `name` (matching the folder) and a
  specific `description` saying *what* and *when*. Keep SKILL.md focused; move detail to
  `references/`.
- New agent: `.claude/agents/<name>.md` with `name`, `description`, optional `tools`, `model`.
- New rule: `.claude/rules/<topic>.md`; add `paths:` frontmatter to scope it to file globs.
- Run `node scripts/verify-toolkit.mjs` after changes.
