# Scope & Activation Rule (highest priority)

## Before the official problem statement exists
- Only toolkit work is permitted: skills, rules, agents, templates, docs, scripts that validate the toolkit.
- Forbidden: creating any website, landing page, dashboard, management system, demo app, mock
  product, invented problem statement, dummy features, or app scaffolding/dependency installs.
- If asked to "start building" without a brief, ask for the problem statement instead.

## When a problem statement is provided
1. Read the whole document — every page, table, footnote and appendix. Never skim.
   - PDFs: `pdfinfo file.pdf` for page count, then `pdftotext -layout file.pdf -` (or the Read
     tool with `pages`, ≤20 pages per call). If text extraction is empty, the PDF is scanned —
     read pages as images with the Read tool.
2. Quote requirements verbatim into `docs/project/01-problem-analysis.md` with page references.
3. Separate **stated** requirements from **assumptions**. Mark every assumption explicitly.
4. Stop and ask the team about ambiguities that change scope, users, data, or judging — before
   writing application code. Minor ambiguities: pick the sensible default and log it.
5. Only after the team confirms the chosen solution: plan → architecture → design → build.

## Always
- Solve the problem in the brief, not a generic version of it.
- Every feature must trace back to a requirement, a user pain point, or a judging criterion.
- If the brief mandates a technology, platform, dataset or deliverable format, that overrides any
  toolkit default.
