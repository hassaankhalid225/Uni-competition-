# Git Workflow During the Hackathon

- Commit small, working increments with imperative messages: `feat(bookings): add approval flow`,
  `fix(auth): redirect after login`, `style(dashboard): tighten table spacing`.
- The default branch must always build and run — it is the demo fallback at any moment.
- Feature work on short-lived branches when more than one person/agent works in parallel; merge
  often to avoid painful conflicts.
- Tag known-good demo states: `git tag demo-v1` before risky changes late in the event.
- Never commit `.env*` (except `.env.example`), build output, `node_modules`, large binaries
  > ~10 MB (use compressed assets or Git LFS), or the organiser's PDF if it is confidential.
- Never force-push a shared branch or rewrite history others have pulled.
- Before the final submission: clean `git status`, README updated, `.env.example` complete.
