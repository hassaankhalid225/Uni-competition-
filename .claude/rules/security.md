# Security Baseline (always on)

- **Secrets never enter source code, commits, logs, screenshots, or client bundles.** Use env
  vars; commit only `.env.example` with placeholder values. Client-exposed env vars
  (`NEXT_PUBLIC_*`, `VITE_*`) must never contain secrets.
- Supabase: the `service_role` key is server-only. Every table exposed to the client has Row
  Level Security enabled with explicit policies.
- Validate and authorise on the **server** for every mutation and every read of private data.
  Hiding a button is not authorisation.
- Parameterised queries / ORM only. Never build SQL with string concatenation of user input.
- Never render untrusted HTML (`dangerouslySetInnerHTML`, `v-html`, `innerHTML`) without
  sanitising (DOMPurify) — prefer not rendering HTML at all.
- Passwords: use the auth provider or argon2/bcrypt. Never store plaintext or reversible hashes.
- Sessions: httpOnly, Secure, SameSite=Lax cookies. No tokens in localStorage for auth when
  avoidable.
- File uploads: check size, MIME type and extension server-side; store outside the web root or in
  object storage with generated names.
- Errors returned to clients never include stack traces, SQL, or internal paths.
- Do not log personal data or credentials. Seed/demo data must be fictional.
- If a secret is ever committed: tell the team immediately, rotate it, then purge history.

Full guidance: `.claude/skills/security-reliability/SKILL.md`.
