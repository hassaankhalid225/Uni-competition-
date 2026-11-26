---
name: management-systems
description: Blueprints for management-style applications - admin dashboards, user/student/staff management, role permissions, resource/inventory/event/booking/task management, approvals, reporting, analytics, notifications, search/filter, exports and activity logs. Use when the challenge involves managing people, records, resources, schedules or workflows (university, business, healthcare, events, etc.). Select only modules the brief actually needs.
---

# Management System Framework

Management systems are judged on **complete workflows**, **correct data**, and **how quickly a
user gets their job done** — not on the number of modules. Pick modules from the catalogue only
when they trace to the brief. Implementation details: `fullstack-engineering` skill and its
references.

## 1. Model the workflow before the screens
For each primary role write the job-to-be-done as a flow:
`trigger → actor action → system response → next actor → completion state`.
Example shape: request submitted → reviewer notified → approve/reject with reason → requester
notified → record updated → appears in reports.
Every status in the flow becomes an enum value with allowed transitions.

## 2. Module catalogue (choose, don't collect)

| Module | Core entities | Key flows | Differentiating touch |
|---|---|---|---|
| Users & roles | profiles, roles, memberships | invite, assign role, deactivate | per-role home screens |
| Students / members | students, programs, enrollments | register, enrol, track progress | at-risk indicators, timeline |
| Staff | staff, departments, assignments | assign, workload view | workload balance view |
| Resources / rooms | resources, bookings | search availability, book, approve | DB-level conflict prevention, calendar view |
| Events | events, registrations, check-ins | create, register, check in (QR) | capacity/waitlist automation |
| Inventory | items, stock_movements, suppliers | stock in/out, low-stock alert | movement history, reorder suggestions |
| Tasks / tickets | tasks, comments, assignees | create, assign, status board | SLA timers, kanban drag & drop |
| Appointments (health etc.) | patients, providers, appointments | schedule, reschedule, records | reminders, privacy by default |
| Approvals | requests, approvals | submit, review, decide | status timeline, reason required |
| Reporting & analytics | SQL views | filter by period, export | actionable insight cards, not vanity charts |
| Notifications | notifications | in-app bell, email | digest, deep links to the item |
| Activity log | activity_logs | auto-record key actions | per-record timeline |
| Search & filters | — | global search, faceted filters | command palette (⌘K) |
| Exports | — | CSV/PDF of filtered views | branded PDF report |

## 3. Screen patterns
- **App shell**: collapsible sidebar (grouped by task, not by table), top bar with search,
  notifications, profile. Breadcrumbs on deep pages.
- **Role home**: "What needs my attention now" — pending approvals, overdue items, today's
  schedule, 3–5 meaningful KPIs. Not a wall of charts.
- **List view**: table with sticky header, search, filters (as chips), sort, pagination, row
  actions, bulk select, saved/URL filters, empty state with primary action.
- **Detail view**: header with status + primary actions, key facts, related records tabs,
  activity timeline.
- **Create/edit**: drawer or dedicated page; sections; inline validation; autosave only if needed.
- **Calendar/board** views for time- or status-driven domains.

## 4. Data integrity checklist
- [ ] Status transitions enforced server-side (state machine)
- [ ] Conflicts (double booking, over-capacity, negative stock) prevented in the DB
- [ ] Deleting a parent has a deliberate effect on children (cascade/restrict/soft delete)
- [ ] Unique business keys (student number, SKU, email) enforced
- [ ] All mutations logged for auditable domains

## 5. Demo data
Seed enough realistic data that lists paginate and charts show trends (e.g. 40–200 rows per
main entity over the last 6–8 weeks), including edge cases the demo will show (an overdue item,
a conflict being prevented, a rejected request).

## 6. Typical MVP cut for a 24h build
Auth + roles → the single most important workflow end-to-end → list/detail/create for its main
entity → role home with attention items → one insight feature → notifications → export. Then
polish.
