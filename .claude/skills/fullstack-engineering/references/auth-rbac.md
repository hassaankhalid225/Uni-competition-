# Authentication & Role-Based Access Control

## Authentication
- Use a provider; never hand-roll crypto. Options: Supabase Auth (fastest with Supabase),
  Auth.js / Better Auth (Next.js + own DB), Clerk (hosted, fastest UI).
- Email + password plus seeded demo accounts per role. Add OAuth only if the brief values it.
- Sessions in httpOnly Secure SameSite=Lax cookies. Server checks the session on every protected
  request (middleware for routing + a check inside each handler/action for security).
- Middleware/proxy redirects are UX, not security — always re-check in the data layer.

## Profiles & roles
```sql
create type app_role as enum ('admin', 'staff', 'member');   -- rename to the domain's roles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role app_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```
For multi-tenant or multi-department needs, add a `memberships(user_id, org_id, role)` table
instead of a single role column.

## Permissions in code
```ts
// src/lib/permissions.ts
export const PERMISSIONS = {
  admin:  ['user.manage', 'record.read.all', 'record.write.all', 'report.view'],
  staff:  ['record.read.all', 'record.write.own', 'report.view'],
  member: ['record.read.own', 'record.write.own'],
} as const satisfies Record<Role, readonly string[]>;

export function can(role: Role, perm: Permission) {
  return (PERMISSIONS[role] as readonly string[]).includes(perm);
}
```
- Check `can()` in every server action/handler, plus an **ownership** check for `*.own`.
- Use the same map to hide UI the user cannot use (UX only).

## Row Level Security (Supabase)
```sql
alter table records enable row level security;

create policy "owner can read" on records for select
  using (owner_id = auth.uid());

create policy "admin can do anything" on records for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
```
- Enable RLS on **every** client-reachable table. Test each policy by logging in as each role.
- Use a `security definer` helper function (e.g. `is_admin()`) to avoid recursive policy lookups.
- The service-role key bypasses RLS: server-only, never in client code.

## Checklist
- [ ] Unauthenticated users redirected from protected routes
- [ ] Each role can only reach its own screens and data (tested by switching accounts)
- [ ] Direct API calls with another user's id return 403/404
- [ ] Password reset / logout work
- [ ] Demo accounts seeded and documented
