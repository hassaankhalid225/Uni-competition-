# UI/UX Plan — Campus Connect

**Audience:** CS students (mostly on phones between classes), moderators, and three admins (on laptops).
**Personality:** studious · warm · precise.
**Concept:** *the department notice board, digitised.* A warm paper-toned canvas and ink-dark
text. Editorial serif headings (like a department bulletin) over a crisp sans UI. One terracotta
accent marks actions and "official" content. Clubs get a consistent monogram tile so each
community is recognisable at a glance.

**Type:** Fraunces (display / headings, variable) + Geist (UI/body) + Geist Mono (counts, dates).
**Colour roles (OKLCH):** paper bg, white surfaces, hairline borders, ink text, muted ink, terracotta
accent, green success, amber warning, red danger. Full dark theme via `prefers-color-scheme`.
**Space:** 4px base; app paddings 16/24; feed max-width 720px; right rail 300px on desktop.

**Layout:** desktop = left sidebar (navigation + "My clubs") · main column · context rail (Home
and club pages). Mobile = compact top bar + bottom tab bar (Home, Clubs, News, Events, Saved),
with the Admin entry in the top bar for admins.

**Key screens:** Home (official strip, then feed from my clubs, then rail with upcoming events) ·
Clubs directory · Club page (header, join, mod badge, pinned first, new/top sort) · Post with
threaded comments · Announcements · Events (Upcoming/Past) · Saved · Admin console (request
queue, moderator assignment) · Auth.

**Motion:** 150–200 ms colour/transform transitions on interactive elements only;
reduced-motion respected. **No 3D**: it adds nothing for a discussion platform in a 4-hour build.

**Role visibility:** moderator tools (pin/delete) render only where `canModerateClub` is true;
admin actions only for admins. All are re-checked on the server.
