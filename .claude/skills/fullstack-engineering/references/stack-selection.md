# Stack Selection Guide

Pick by the brief's needs, not habit. Confirm current stable versions at kickoff
(`npm view <pkg> version`) and follow each framework's official getting-started docs.

## Decision table

| Situation | Recommended stack |
|---|---|
| Web app with auth, DB, dashboards (most management systems) | **Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + Supabase (Postgres/Auth/Storage)** with Drizzle or supabase-js |
| Heavy client interactivity / 3D-first experience, light backend | **Vite + React + TS** + R3F, backend via Supabase or a small Hono/Express API |
| Data science / ML / Python-mandated / heavy data processing | **FastAPI + Pydantic + SQLAlchemy/SQLModel + Postgres**, frontend Next.js or Vite React |
| Mandated stack in brief (PHP/Laravel, Django, Java, .NET, mobile) | Use it. Apply the same architecture principles and rules. |
| Mobile app required | Expo (React Native) + Supabase; or responsive PWA if "mobile-friendly" is enough |
| Real-time collaboration (chat, live board) | Supabase Realtime or Liveblocks; Socket.IO only with a custom server |
| Offline-only / single machine demo | Vite React + SQLite (better-sqlite3) or IndexedDB (Dexie) |

## Default "full-stack web" preset
- Next.js App Router, React 19, TypeScript strict
- Tailwind CSS v4 (CSS-first `@theme` tokens) + shadcn/ui
- Zod for validation, React Hook Form for complex forms
- Supabase: Postgres + Auth + Storage + Realtime (RLS on), or Postgres + Drizzle + Auth.js
- TanStack Table, Recharts, date-fns, lucide-react icons
- Motion (`motion/react`) for UI motion; GSAP + ScrollTrigger for scroll storytelling
- Three.js via @react-three/fiber + @react-three/drei, only if 3D is justified
- Vitest + Testing Library, Playwright for E2E
- Deploy: Vercel (frontend/full-stack) + Supabase cloud; fallback: local `npm run build && npm start`

## Scaffolding commands (run only after the brief is analysed and stack approved)
```bash
npx create-next-app@latest app --ts --tailwind --eslint --app --src-dir --import-alias "@/*"
npx shadcn@latest init
npm create vite@latest app -- --template react-ts
```
Commit immediately after scaffolding, before customising.

## Environment variables
- Keep a complete `.env.example` with comments. Validate env at startup with Zod
  (`src/env.ts`) so missing keys fail loudly.

## Deployment & demo safety
- Deploy early (first slice) to catch environment issues before the deadline.
- Venue Wi-Fi is unreliable: verify the app can run locally against a local or cloud DB, and
  record a backup demo video.
- Seed demo accounts for each role; put credentials in the README (demo-only accounts).
