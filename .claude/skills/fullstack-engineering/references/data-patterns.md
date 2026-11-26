# Data & Feature Patterns

## Schema design steps
1. List domain nouns from the problem analysis → candidate entities.
2. For each relationship decide cardinality (1:1, 1:N, M:N → join table with its own attributes,
   e.g. `enrollments(student_id, course_id, grade)`).
3. Identify state machines (`status` enum + allowed transitions) and audit needs.
4. Add constraints: NOT NULL, FK with `on delete` choice (`cascade` for owned children,
   `restrict` for references, `set null` for optional links), UNIQUE, CHECK.
5. Index FKs and filter/sort columns. Composite index matching the most common query
   (`(status, created_at desc)`).

Conventions: `snake_case`, plural tables, `id uuid default gen_random_uuid()`,
`created_at`/`updated_at timestamptz default now()`, money as `numeric(12,2)` or integer cents,
time as `timestamptz` (store UTC, display local).

## Preventing conflicts in the DB (bookings, scheduling)
```sql
create extension if not exists btree_gist;
alter table bookings add constraint no_overlap
  exclude using gist (resource_id with =, tstzrange(starts_at, ends_at) with &&)
  where (status <> 'cancelled');
```

## Migrations & seeds
- Drizzle: `drizzle-kit generate` + `drizzle-kit migrate`. Prisma: `prisma migrate dev`.
  Supabase: `supabase migration new <name>` + `supabase db reset` locally.
- `seed` script: idempotent (upsert), realistic fictional names/dates spread over recent weeks so
  charts look natural, one demo account per role, a few edge cases (overdue, rejected, empty).

## CRUD & lists
- List endpoints: `?q=&status=&sort=created_at:desc&page=1&pageSize=20` validated by Zod;
  return `{ data, page, pageSize, total }` (or cursor for infinite lists).
- Search: `ILIKE '%q%'` with `pg_trgm` index for small data; `tsvector` + GIN for full text.
- Debounce search inputs (~300ms); keep filters in the URL.
- Bulk actions in a transaction; confirm destructive actions; offer undo where cheap.

## File uploads
- Client requests a signed upload URL from the server (after auth + validation of type/size);
  uploads directly to storage; server stores a `files` row (owner, path, mime, size).
- Serve private files through signed, expiring URLs.

## Notifications
- `notifications(id, user_id, type, title, body, link, read_at, created_at)`; create rows in the
  service layer when events happen; bell with unread count; mark-as-read endpoint.
- Realtime push via Supabase channel/SSE if it strengthens the demo; otherwise poll every 30s.

## Activity / audit log
`activity_logs(id, actor_id, action, entity_type, entity_id, metadata jsonb, created_at)`, written
alongside key mutations. Surfaces as a timeline on detail pages — cheap, and judges like it.

## Analytics & dashboards
- Compute with SQL (`count`, `sum`, `date_trunc` grouping) in views or server functions.
- Each KPI answers a question a user actually has; show trend vs. previous period only when real.
- Charts: correct type (line = trend, bar = comparison, stacked = composition); labelled axes;
  accessible colours; empty state when no data.

## Exports
- CSV: server route streaming rows with proper escaping and `Content-Disposition`.
- PDF: `@react-pdf/renderer` for designed reports, or a print stylesheet for simple pages.
- Excel only if the brief asks (`exceljs`).
