# Campus Connect

A community platform for **CS Department students**: topic-based clubs with their own
discussion feeds, official departmental announcements, and an event calendar, with role-based
access for **Admins** (Head CR, Head GR, HOD), **club Moderators** and **Students**.

Built for the Campus Connect Webathon, Department of Computer Science, **University of Sargodha** (`brief/`).

**Team:** Hassaan Khalid · Usman Shoukat · Yumna Aziz · Hamna

## Features

| Area | What works |
|---|---|
| Clubs | Explore, join/leave, request a new club, track request status |
| Club feeds | Text / link / image or document posts, threaded comments & replies, up/down votes, Newest/Top sort, bookmarks (Saved page) |
| Moderation | Moderators pin and delete posts/comments **only in clubs they're assigned to** |
| Admin console | Approve/reject club requests (approval creates the club), assign/remove moderators |
| Announcements | Admins publish text + link + attachment; publication date/time shown |
| Events | Upcoming / Past tabs; admins create, edit, cancel/restore (title, description, date, time, venue) |
| Home | One screen: latest official announcements, posts from my clubs, upcoming events |
| Landing page | `/welcome`: interactive 3D constellation of the department hub and its clubs (Three.js), live platform counts, product preview, roles, team credits |
| Responsive | Sidebar layout on desktop, bottom tab bar on mobile; light & dark themes |

## Roles & access control

| Capability | Student | Moderator | Admin |
|---|---|---|---|
| Join/leave clubs, request clubs | ✓ | ✓ | ✓ |
| Post, comment, reply, vote, save (joined clubs) | ✓ | ✓ | ✓ (all clubs) |
| Pin / delete any post or comment | — | own clubs only | all clubs |
| Review club requests, assign moderators | — | — | ✓ |
| Publish announcements, manage events | — | — | ✓ |

All rules live in **`src/lib/auth/permissions.ts`** and are enforced inside every server action
(`src/actions/*`). Hiding buttons in the UI is only cosmetic. Moderation is club-scoped: a row in
`club_moderators`, not a global role.

## Tech stack

Next.js 16 (App Router, Server Components, Server Actions) · React 19 · TypeScript · Tailwind CSS v4
· PostgreSQL · Drizzle ORM · Zod · own auth (bcrypt password hashes + signed JWT in an httpOnly
cookie, via `jose`). Uploads (≤ 4 MB) are stored in Postgres and served by
`src/app/api/attachments/[id]/route.ts`.

```
src/
  actions/        server actions: auth, clubs, posts, admin, department (announcements/events)
  app/(auth)/     login, register
  app/(app)/      signed-in pages: home, clubs, posts, announcements, events, saved, admin
  components/     UI building blocks (post card, forms, nav, cards)
  lib/auth/       session cookie, current user, permissions
  lib/db/         schema, client, migrate & seed scripts
  lib/queries/    read queries (feeds, clubs, admin, department)
  lib/validation.ts  zod schemas for every form
drizzle/          SQL migrations
```

## Run locally

```bash
npm install
cp .env.example .env.local        # set DATABASE_URL and SESSION_SECRET
npm run db:setup                  # apply migrations + load demo data
npm run dev                       # http://localhost:3000
```

`npm run db:seed` resets the database to the demo state at any time.
If your network blocks Postgres port 5432 (common on campus Wi-Fi), use `npm run db:setup:http`
with a Neon URL instead: it runs the same migrations and seed over HTTPS.

### Demo accounts (fictional sample data, password `campus123`)

| Role | Email |
|---|---|
| Admin: HOD | hod@campus.test |
| Admin: Head CR | headcr@campus.test |
| Admin: Head GR | headgr@campus.test |
| Moderator (AI & ML Society, Web Dev Guild) | moderator@campus.test |
| Student | student@campus.test |

## Deploy to Vercel

1. Vercel → **Add New → Project** → import this GitHub repo (framework auto-detected: Next.js).
2. In the project: **Storage → Create Database → Neon (Postgres)** → connect it to the project.
   This adds `DATABASE_URL` to the environment.
3. **Settings → Environment Variables** → add `SESSION_SECRET` (any random string of 32+ characters).
4. Create the tables and demo data from your machine against the production database:
   ```bash
   DATABASE_URL="<pooled Neon URL from Vercel>" npm run db:setup
   ```
5. **Deployments → Redeploy**. Open the URL and sign in with a demo account.

## Quality checks

```bash
npm run typecheck && npm run lint && npm run build
node tests/e2e-smoke.cjs   # 40 end-to-end checks across all roles (see header for setup)
```
