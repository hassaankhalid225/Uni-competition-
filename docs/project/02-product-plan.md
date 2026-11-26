# Product Plan — Campus Connect

**Value proposition:** One home for the CS department. Your clubs' discussions, official
announcements and the event calendar on a single screen, with clear roles (Admin / Moderator /
Student) enforced on the server.

**Decisions (Gate A, confirmed by the team):** Concept B "Department hub" · Next.js + Postgres +
own auth · Vercel hosting (Neon Postgres via Vercel Storage) · optional: votes, pins, bookmarks,
uploads.

## MVP user stories (all Must)
| ID | Story | Acceptance | Traces |
|---|---|---|---|
| US-01 | As a student I sign up / log in / log out | Session cookie; protected pages redirect to /login | FR-I-01, NFR-02 |
| US-02 | As a student I explore clubs and join/leave | Member count updates; my clubs appear in sidebar | FR-01 |
| US-03 | As a student I request a new club; see request status | Pending/approved/rejected visible | FR-02 |
| US-04 | As an admin I approve/reject requests (with note) | Approve creates club, requester joins | FR-03 |
| US-05 | As an admin I assign/remove moderators per club | Moderator sees mod tools only in that club | FR-04, FR-05 |
| US-06 | As a member I create text/link posts in a club feed | Post appears in club + Home feed | FR-06 |
| US-07 | As a member I comment and reply (threaded) | Nested replies render | FR-06, FR-I-03 |
| US-08 | As a moderator I delete any post/comment and pin posts in my club only | Server rejects in other clubs (403) | FR-05, FR-07 |
| US-09 | As an admin I publish announcements (text, link, attachment) with date/time | Visible to all, newest first | FR-08, FR-09 |
| US-10 | As an admin I create/update/cancel events; everyone sees upcoming/past | Cancelled stays visible, labelled | FR-10, FR-11 |
| US-11 | Home: announcements strip + upcoming events + posts from my clubs | One page answers "what's new for me" | Concept B |

## Should (after all Musts)
Up/down votes with score + "Top" sort (FR-07) · Bookmarks + Saved page (FR-07) · File/image
attachments on posts & announcements, ≤ 4 MB, stored in Postgres (FR-07, FR-09).

## Could
Dark mode · search clubs · edit own post.

## Won't (this event)
Real-time updates, notifications, email verification, DMs, reports/audit log.

## Demo accounts (seeded, fictional)
Head CR / Head GR / HOD (admins), one moderator, two students. Password for all: in README.
