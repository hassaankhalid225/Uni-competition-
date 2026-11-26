---
name: security-reliability
description: Security and reliability guidance for web apps - secure authentication and sessions, authorisation and RLS, input validation, SQL injection and XSS prevention, CSRF, secure API design, rate limiting, secrets and environment variables, file upload safety, data privacy, error handling and logging, dependency auditing. Use when building auth, APIs, forms, uploads, database access, handling personal data, or doing a pre-submission security pass.
---

# Security & Reliability

Baseline rules are always on (`.claude/rules/security.md`). This skill is the detailed playbook.

## Threat model in 5 minutes (do at architecture stage)
List: assets (personal data, grades, payments, admin powers) → actors (anonymous, each role,
malicious user) → entry points (forms, APIs, uploads, URLs) → top 5 risks + mitigation. Record in
`docs/project/04-system-architecture.md`.

## Authentication & sessions
- Provider-based auth (Supabase/Auth.js/Better Auth/Clerk). httpOnly, Secure, SameSite=Lax cookies.
- Rate-limit login/signup/reset (e.g. 5/min/IP) — Upstash Ratelimit or a simple in-DB counter.
- Generic login errors ("Invalid email or password"). Session invalidated on logout/password change.

## Authorisation
- Deny by default. Check role **and** ownership on the server for every read/write of private data.
- IDOR test: change an id in the URL/API call to another user's record → must be 403/404.
- Supabase: RLS on all tables; never use the service-role key in the browser.

## Input validation & injection
- Zod/Pydantic schemas at every boundary: body, query, params, headers you rely on, env vars.
- Whitelist fields on update (no mass assignment of `role`, `owner_id`, `status`).
- SQL: ORM or parameterised queries only. Dynamic `ORDER BY` columns from a whitelist.
- XSS: rely on framework escaping; no `dangerouslySetInnerHTML` with user content (DOMPurify if
  unavoidable); sanitise Markdown rendering; set a Content-Security-Policy where feasible.
- CSRF: SameSite cookies + framework protections (Next.js server actions check origin); for
  custom cookie-auth APIs verify `Origin`.
- SSRF: never fetch arbitrary user-provided URLs server-side without an allowlist.

## Secrets
- `.env.local` (gitignored) for real values; `.env.example` with placeholders committed.
- Validate env at startup; fail fast on missing secrets.
- Before every push: `git diff --cached` scan for keys; optionally run `gitleaks detect`.
- Client bundles: only `NEXT_PUBLIC_*`/`VITE_*` vars reach the browser — never secrets there.
- AI/third-party keys: server-side only, with usage limits and timeouts.

## File uploads
Size limit, MIME + extension allowlist, generated filenames, private bucket + signed URLs, no
execution of uploaded content, images re-encoded if displayed publicly.

## Data privacy
Collect the minimum. Mask sensitive fields in lists. Seed data fictional. Mention privacy
measures in the pitch when the domain is sensitive (health, students, finance) — judges value it.

## Reliability
- Every external call: timeout, retry with backoff for idempotent calls, fallback UI.
- Error boundaries per route segment (`error.tsx`), `not-found.tsx`, global toast for failures.
- Transactions for multi-step writes; idempotency for retries of create actions where duplicates
  hurt.
- Structured server logs with request id; no PII.
- Health check route for deployment verification.

## Dependency safety
`npm audit --omit=dev` before submission; avoid abandoned/typosquatted packages (verify exact
name and publisher); lockfile committed.

## Pre-submission security checklist
- [ ] No secrets in repo history (`git log -p | grep -iE "key|secret|password"` spot-check)
- [ ] RLS/authorisation tested per role, IDOR test done
- [ ] All forms validated server-side; error messages generic
- [ ] Upload restrictions enforced
- [ ] Security headers (CSP basic, X-Content-Type-Options, Referrer-Policy) where possible
- [ ] `npm audit` reviewed
