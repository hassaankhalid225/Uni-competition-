---
name: fullstack-engineering
description: Full-stack architecture and implementation guidance - choosing the stack for the challenge, frontend architecture, state, forms, routing, REST APIs and server actions, authentication, role-based access control, PostgreSQL/Supabase schema design, migrations, indexing, CRUD, search/filter/pagination, file uploads, notifications, analytics, charts and CSV/PDF export. Use when planning architecture, scaffolding the app, or building any frontend/backend/database feature.
---

# Full-Stack Engineering

Choose the **simplest reliable architecture** that delivers the brief. Read
`references/stack-selection.md` before scaffolding. Detailed patterns:
- `references/auth-rbac.md` — authentication, sessions, roles, permissions, RLS
- `references/data-patterns.md` — schema design, migrations, CRUD, search, pagination, uploads,
  exports, notifications, analytics

## Architecture principles
- **Monolith first.** One deployable app (e.g. Next.js full-stack, or SPA + one API) and one
  Postgres DB. No microservices, queues, or caches unless the brief demands them.
- **Layers:** UI → (server action / route handler / controller) → service (business rules) →
  data access (ORM / Supabase client) → DB. Validation at the boundary, authorisation in the
  service or handler, integrity in the DB.
- **Contract-first** when splitting work: agree on types/Zod schemas and endpoint list in
  `docs/project/07-api-spec.md` so frontend and backend can build in parallel.
- **Demo safety:** seed script with realistic data; app runs locally with one command;
  graceful fallback if an external API fails.

## Frontend architecture
- Routing by role/area: `/(public)`, `/(auth)`, `/app/<area>`, `/admin`.
- State: server state via the framework (RSC data fetching) or TanStack Query; local UI state
  with `useState`/`useReducer`; global client state (Zustand) only if truly shared. URL holds
  filters, search, pagination and tabs (shareable, back-button friendly).
- Forms: React Hook Form + Zod resolver (or native forms + server actions + Zod). Same schema on
  client and server.
- UI kit: shadcn/ui (Radix primitives, owned code) customised to our design tokens — never
  shipped with default styling untouched.
- Data tables: TanStack Table for sorting/filtering/pagination; server-side for large data.
- Charts: Recharts (simple) or ECharts/visx (advanced). Use the `dataviz` guidance for colour.
- Every view: loading skeleton, empty state, error with retry, optimistic UI where safe.

## Backend architecture
- REST resource naming: `GET /api/bookings`, `POST /api/bookings`, `PATCH /api/bookings/:id`,
  `POST /api/bookings/:id/approve` for state transitions.
- Handler template: `auth → authorize → parse(schema) → service → map to response`.
- Business rules as pure functions where possible (easy to unit test): eligibility, pricing,
  conflict detection, status transitions (explicit state machines).
- Errors: typed domain errors mapped to HTTP codes in one place.
- Background-ish work (emails, notifications) inline for a hackathon; keep it idempotent.
- Rate-limit auth and any expensive/AI endpoint.

## Database
- PostgreSQL by default (Supabase for instant auth + storage + realtime; Neon/local Docker
  otherwise). SQLite only for single-user offline demos.
- ORM: Drizzle (SQL-like, light) or Prisma (DX, studio). Pick one; migrations in git.
- Model the domain nouns from the problem analysis; draw the ERD in
  `docs/project/06-database-design.md` before writing migrations.

## Feature recipes (summary — see references for detail)
| Feature | Default approach |
|---|---|
| Auth | Supabase Auth or Auth.js/Better Auth; email+password + seeded demo accounts per role |
| RBAC | `role` enum on profile + permission map in code + DB policies/RLS |
| Search/filter | URL params → validated → indexed `WHERE`/`ILIKE`/`tsvector`; debounce input |
| Uploads | Supabase Storage / S3 presigned URLs; validate type/size; store metadata row |
| Notifications | `notifications` table + in-app bell; realtime via Supabase channel or polling; email via Resend if needed |
| Analytics | SQL aggregates (views/materialised views) → chart components; real numbers only |
| Export | CSV streamed from server; PDF via `@react-pdf/renderer` or print stylesheet |
| Audit log | `activity_logs` table written in the service layer for key mutations |
| Realtime | Supabase Realtime or SSE; only where it improves the demo or is required |
| AI features | Server-side call, streaming response, timeout + fallback, never expose keys |

## Quality gates per slice
Types + lint + build pass; happy path and one failure path exercised; role checks verified;
loading/empty/error states present; mobile layout checked.
