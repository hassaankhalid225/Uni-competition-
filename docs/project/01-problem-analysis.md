# Problem Analysis — Campus Connect (Webathon)

> Source: `brief/campus-connect-challenge.pdf` · 2 pages · fully read.
> **[ASSUMPTION]** marks anything not stated in the brief.

## 1. Event facts
| Item | Value | Source |
|---|---|---|
| Development window | 5:00 PM – 9:00 PM (**4 hours**) | p1 |
| Hosting window | 9:00 – 10:00 PM, deployment only, *no development* | p1, §4 |
| Submission | GitHub repo (complete source, accessible) by 9:00 PM; live link by 10:00 PM | p1, §4 |
| Stack | Team's choice; AI coding tools allowed | p1, §3–4 |
| Explanation | Team members must understand and explain the code | p1, §4 + 10% of score |
| Team size / demo length | Not stated | — |

Time class: ≤ 6h event → default stack, no experiments, **no 3D** (`docs/playbook/time-strategy.md`).

## 2. Problem in one sentence
CS students have no single place to find their peers by interest, share resources, discuss club
and society activity, and get official department news and event dates.

## 3. Users & pain points
| Role | Goal | Pain today |
|---|---|---|
| Student | Find & join communities, discuss, share resources, stay updated | Info scattered over WhatsApp groups, notice boards, word of mouth; misses announcements/events |
| Moderator (per club) | Keep their club's discussion useful & clean | No tools: can't pin, remove, or curate content |
| Admin (Head CR, Head GR, HOD — equal access) | Govern clubs, publish official info, run the calendar | No official, persistent channel; club creation is informal |

## 4. Root cause
Fragmented, unofficial channels → no single source of truth and no structured governance
(who can create clubs, who moderates, what is official). Category: **information + coordination gap**.

## 5. Functional requirements (verbatim, p1)
| ID | Requirement |
|---|---|
| FR-01 | Students can explore available clubs and join or leave them. |
| FR-02 | Students can suggest/request the creation of new clubs. |
| FR-03 | Admins can approve or reject [club] requests. |
| FR-04 | Admins assign moderators to individual clubs. |
| FR-05 | Moderators manage discussions and content within their assigned clubs **only**. |
| FR-06 | Each club has its own discussion feed supporting text posts, link sharing, comments, and replies. |
| FR-07 | *Optional:* upvotes/downvotes, pinned posts, bookmarks, image/document sharing. |
| FR-08 | Admins can publish official announcements; students can view them. |
| FR-09 | Announcements may include text, links, or attachments, with publication date and time displayed. |
| FR-10 | Display upcoming and past departmental events. |
| FR-11 | Admins can create, update, or cancel events (title, description, date, time, venue). |
| FR-12 | Admins = Head CR, Head GR, HOD with the same platform-level access. |
| FR-13 | Students: join/leave clubs, create posts, comment, reply, participate, request clubs. |

### Implied requirements
| ID | Requirement | Reasoning |
|---|---|---|
| FR-I-01 | Sign up / log in / log out | §3 "user authentication" |
| FR-I-02 | Posting in a club requires membership **[ASSUMPTION]** | Reddit-like community semantics |
| FR-I-03 | Replies are nested (threaded comments) | "comments, and replies" |
| FR-I-04 | Moderator actions: delete/pin posts & comments in own club | "manage discussions and content" |
| FR-I-05 | Admin UI to view requests, assign/remove moderators | FR-03/04 |
| FR-I-06 | Authors can edit/delete their own posts/comments | standard expectation |

## 6. Non-functional requirements (p1 §3)
| ID | Requirement |
|---|---|
| NFR-01 | Working frontend + backend, DB integration, **persistent** data |
| NFR-02 | Authentication + role-based access control (enforced, not just hidden buttons) |
| NFR-03 | Responsive on desktop and mobile |
| NFR-04 | Core features functional — static UI / dead buttons = incomplete |
| NFR-05 | Code must be explainable by the team → simple, readable architecture |

## 7. Judging criteria (p2)
| Criterion | Weight | Implication |
|---|---|---|
| Functional implementation | 30% | Every FR-01…13 working end-to-end; no dead buttons |
| UI/UX & responsiveness | 20% | Distinctive, polished design; mobile nav designed, not stacked |
| Code quality & organization | 15% | Clear layers, typed, validated, consistent |
| Backend & DB integration | 15% | Real relational schema, constraints, migrations, seed |
| Role-based access control | 10% | Server-enforced; per-club moderator scope; demonstrable |
| Code explanation | 10% | Avoid magic; small codebase the team can walk through |

## 8. Ambiguities (proposed defaults)
| # | Question | Default | Blocks? |
|---|---|---|---|
| 1 | Hosting accounts (Vercel + Postgres provider) ready? | Vercel + Neon (or Supabase Postgres) | Yes – stack |
| 2 | Attachments: real file upload or links? | Links in MVP; uploads only if time | Scope |
| 3 | Who can register? | Open sign-up → Student; admins seeded (Head CR, Head GR, HOD) | No |
| 4 | Must a moderator be a member? | Assigning a moderator auto-joins them | No |
| 5 | "Cancel" event = delete? | Status `cancelled`, stays visible with label | No |
| 6 | Announcements per club? | Department-wide only (admin) | No |
| 7 | Can admins moderate any club? | Yes (platform-level access) | No |

## 9. Solution concepts
**A — Faithful Reddit clone.** Clubs list, club feeds, posts/comments/votes, separate announcement
and event pages, admin panel. Covers FRs; looks like what every team builds.

**B — "Department hub" (recommended).** Same complete feature set, but the IA is built around the
student's day: a **Home** that merges *official announcements (pinned strip) + upcoming events +
posts from my clubs*; role-aware UI everywhere (mod tools appear only in clubs you moderate);
an **Admin console** with a club-request queue and moderator assignment. Optional features chosen
for score/effort: votes, pinned posts, bookmarks.

**C — Moderation/governance-first.** Heavy admin tooling (reports, audit logs, analytics). Strong
RBAC story but steals time from the 30% functional + 20% UI criteria.

## 10. Decision matrix (official weights)
| Criterion (weight) | A | B | C |
|---|---|---|---|
| Functional (30%) | 4 | 5 | 4 |
| UI/UX (20%) | 3 | 5 | 3 |
| Code quality (15%) | 4 | 4 | 4 |
| Backend & DB (15%) | 4 | 4 | 4 |
| RBAC (10%) | 4 | 5 | 5 |
| Explanation (10%) | 4 | 4 | 3 |
| **Weighted** | **3.80** | **4.60** | **3.80** |

**Recommendation: B.** Same build cost as A (the merged Home is one query), clearly better UX and
RBAC demo. C overinvests in non-weighted features.

## 11. Stack recommendation
**Next.js (App Router, server actions) + TypeScript + Tailwind + Drizzle ORM + PostgreSQL +
own cookie-session auth (bcrypt + signed JWT cookie)**, deployed on Vercel + Neon/Supabase Postgres.
- Verifiable end-to-end here (local Postgres 16 available); production needs only `DATABASE_URL`
  and `SESSION_SECRET`.
- Auth/RBAC is ~150 lines of our own readable code → strong for the 10% explanation + 10% RBAC.
- Alternative: Supabase (Auth + RLS + Storage) — faster uploads, but RLS/auth magic is harder to
  explain and can't be verified here without the team's project keys.

## 12. Riskiest unknowns
1. **Deployment** — de-risk by deploying a skeleton early, not at 9 PM.
2. **4-hour scope** — MVP = all mandatory FRs; optional items strictly after.
