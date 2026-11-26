---
paths:
  - "**/api/**"
  - "**/server/**"
  - "**/services/**"
  - "**/actions/**"
  - "**/db/**"
  - "**/prisma/**"
  - "**/drizzle/**"
  - "**/supabase/**"
  - "**/migrations/**"
  - "**/*.sql"
  - "**/*.py"
---

# Backend & Database Rules

## API
- Every endpoint / server action: authenticate → authorise (role + ownership) → validate input →
  run business logic in a service → return a consistent shape.
- Consistent error envelope: `{ "error": { "code": "BOOKING_CONFLICT", "message": "…" } }` with
  correct HTTP status (400 validation, 401 unauthenticated, 403 forbidden, 404, 409 conflict,
  422 business-rule violation, 500 unexpected).
- List endpoints support pagination (limit/cursor or page/pageSize), sorting and filtering via
  validated query params. Never return unbounded lists.
- Mutations that touch multiple rows run in a transaction.
- Log unexpected errors server-side with a request id; never leak internals to the client.

## Database
- Schema changes only via migrations committed to the repo. Never hand-edit production schema.
- Every table: primary key (`uuid` or `bigint identity`), `created_at`, `updated_at`; soft delete
  (`deleted_at`) only where the domain needs history.
- Enforce integrity in the DB: `NOT NULL`, foreign keys with deliberate `ON DELETE` behaviour,
  `UNIQUE`, `CHECK` constraints, enums/lookup tables for fixed sets.
- Index every foreign key and every column used in frequent `WHERE`/`ORDER BY`/joins.
  Prevent double-booking style conflicts with unique or exclusion constraints, not just app code.
- Avoid N+1 queries: use joins/`include`/batched queries. Select only needed columns for lists.
- Seed script produces realistic, fictional demo data and is idempotent.
- Supabase/Postgres exposed to clients: RLS enabled on every table, policies tested per role.
