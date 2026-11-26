# Verification & Honesty

- Never say "works", "tested", "fixed", "responsive" or "accessible" unless you actually ran the
  check. State exactly what was verified and how (command, test, browser viewport, screenshot).
- If a check could not be run (no browser, no DB, missing key), say so plainly and list it as
  unverified.
- Report failing tests and build errors verbatim; do not hide or reinterpret them.
- Never skip, delete or weaken a test to make it pass. Fix the code or explain why the test is
  wrong.
- Visual quality is judged by looking at rendered screenshots (Playwright at 1440px, 768px and
  390px widths), not by reading CSS. Use modern libraries ≠ well designed.
- No fake data presented as real: statistics, testimonials, logos, user counts and "trusted by"
  claims must be real or clearly labelled as sample data.
- Definition of done for any feature: types pass, lint passes, build passes, the user flow was
  exercised end-to-end, and edge/error states were checked.
