// Resets the database to a realistic demo state. All people and content are fictional.
// Run: npm run db:seed   (WARNING: deletes existing data)
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import postgres from "postgres";
import { getDatabaseUrl } from "./url";
import * as s from "./schema";
import { supabaseUserResolver } from "./seed-auth";

const DEMO_PASSWORD = "campus123";
const HOUR = 3600_000;
const DAY = 24 * HOUR;
const ago = (ms: number) => new Date(Date.now() - ms);
/** A date `days` from today at hh:mm Pakistan time. */
function pkt(days: number, hh: number, mm = 0) {
  const d = new Date(Date.now() + days * DAY);
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi" }).format(d);
  return new Date(`${ymd}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00+05:00`);
}

type AnyPgDb = PgDatabase<PgQueryResultHKT, typeof s>;

/** Wipes and refills every table. Shared by the TCP (this file) and HTTPS (seed-http.ts) runners. */
export async function seedDatabase(db: AnyPgDb) {
  await db.execute(sql`truncate table
    bookmarks, post_votes, comments, posts, club_moderators, club_members, club_requests,
    announcements, events, clubs, attachments, users restart identity cascade`);

  const people = [
    { key: "hod", name: "Dr. Sana Qureshi", email: "hod@campus.test", role: "admin", adminTitle: "HOD" },
    { key: "headcr", name: "Bilal Ahmed", email: "headcr@campus.test", role: "admin", adminTitle: "Head CR" },
    { key: "headgr", name: "Mahnoor Iqbal", email: "headgr@campus.test", role: "admin", adminTitle: "Head GR" },
    { key: "hamza", name: "Hamza Siddiqui", email: "moderator@campus.test", role: "student", adminTitle: null },
    { key: "ayesha", name: "Ayesha Khan", email: "student@campus.test", role: "student", adminTitle: null },
    { key: "usman", name: "Usman Tariq", email: "usman@campus.test", role: "student", adminTitle: null },
    { key: "fatima", name: "Fatima Noor", email: "fatima@campus.test", role: "student", adminTitle: null },
    { key: "zain", name: "Zain Raza", email: "zain@campus.test", role: "student", adminTitle: null },
    { key: "hira", name: "Hira Shah", email: "hira@campus.test", role: "student", adminTitle: null },
  ] as const;

  // Each demo profile shares its id with the matching Supabase Auth account.
  const resolve = supabaseUserResolver();
  if (!resolve) console.warn("Supabase env not set: demo profiles get random ids and cannot sign in.");
  const ids: string[] = [];
  for (const p of people) ids.push(resolve ? await resolve(p.email, DEMO_PASSWORD, p.name) : crypto.randomUUID());
  const insertedUsers = await db
    .insert(s.users)
    .values(people.map((p, i) => ({ id: ids[i], name: p.name, email: p.email, role: p.role, adminTitle: p.adminTitle })))
    .returning({ id: s.users.id, email: s.users.email });
  const u = Object.fromEntries(people.map((p) => [p.key, insertedUsers.find((x) => x.email === p.email)!.id])) as Record<
    (typeof people)[number]["key"],
    string
  >;

  const clubDefs = [
    { key: "ai", slug: "ai-ml-society", name: "AI & ML Society", description: "Papers, projects and study groups on machine learning, from linear regression to transformers." },
    { key: "cp", slug: "competitive-programming", name: "Competitive Programming", description: "Weekly contests, editorial discussions and ICPC prep for the department team." },
    { key: "web", slug: "web-dev-guild", name: "Web Dev Guild", description: "Building for the web: frontend, backend, deployment and code reviews." },
    { key: "sec", slug: "cybersecurity-circle", name: "Cybersecurity Circle", description: "CTF practice, security news and responsible-disclosure write-ups." },
    { key: "game", slug: "game-dev-lab", name: "Game Dev Lab", description: "Unity, Godot and game jams. Show your builds, get playtesters." },
  ] as const;
  const insertedClubs = await db
    .insert(s.clubs)
    .values(clubDefs.map((d, i) => ({ slug: d.slug, name: d.name, description: d.description, createdBy: u.headcr, createdAt: ago((60 - i * 5) * DAY) })))
    .returning({ id: s.clubs.id, slug: s.clubs.slug });
  const c = Object.fromEntries(clubDefs.map((d) => [d.key, insertedClubs.find((x) => x.slug === d.slug)!.id])) as Record<
    (typeof clubDefs)[number]["key"],
    string
  >;

  const memberships: [keyof typeof u, keyof typeof c][] = [
    ["hamza", "ai"], ["hamza", "web"], ["hamza", "cp"],
    ["ayesha", "ai"], ["ayesha", "web"],
    ["usman", "cp"], ["usman", "sec"], ["usman", "ai"],
    ["fatima", "web"], ["fatima", "game"], ["fatima", "ai"],
    ["zain", "cp"], ["zain", "game"], ["zain", "sec"],
    ["hira", "ai"], ["hira", "sec"], ["hira", "web"],
  ];
  await db.insert(s.clubMembers).values(memberships.map(([user, club]) => ({ userId: u[user], clubId: c[club] })));
  await db.insert(s.clubModerators).values([
    { clubId: c.ai, userId: u.hamza, assignedBy: u.hod },
    { clubId: c.web, userId: u.hamza, assignedBy: u.headcr },
    { clubId: c.sec, userId: u.usman, assignedBy: u.headgr },
  ]);

  const postDefs = [
    { key: "p1", club: "ai", author: "hamza", pinned: true, age: 6 * DAY, title: "Welcome! Read this before posting", body: "This club is for anything ML: questions, paper discussions, project showcases. Be specific when asking for help (share your code and error). Reading group meets every Thursday after the 2nd lecture slot in Lab 3." },
    { key: "p2", club: "ai", author: "ayesha", age: 5 * HOUR, title: "Study group for Deep Learning midterm?", body: "Midterm covers CNNs, backprop and regularisation. Anyone up for a revision session on Saturday in the library discussion room? I can bring my notes on batch norm." },
    { key: "p3", club: "ai", author: "hira", age: 2 * DAY, title: "Great visual explanation of attention", link: "https://jalammar.github.io/illustrated-transformer/", body: "Helped me finally understand query/key/value. Worth 20 minutes before the NLP lecture." },
    { key: "p4", club: "cp", author: "usman", age: 9 * HOUR, title: "Weekend contest #12: editorial thread", body: "Problem D needed a segment tree with lazy propagation. Post your approaches for E. I couldn't get it under the time limit with a plain DP." },
    { key: "p5", club: "cp", author: "zain", age: 3 * DAY, title: "ICPC regional team trials: dates?", body: "Does anyone know when the department will run trials this year? Want to plan practice around it." },
    { key: "p6", club: "web", author: "fatima", age: 1 * DAY, title: "Code review swap for semester projects", body: "Pair up and review each other's repos before submission. Comment with your stack and I'll match people." },
    { key: "p7", club: "web", author: "hamza", age: 4 * DAY, title: "Free hosting options that actually work for student projects", link: "https://vercel.com/docs", body: "Vercel for Next.js, Render for Express APIs, Neon for Postgres. All have free tiers that are fine for demos." },
    { key: "p8", club: "sec", author: "hira", age: 2 * DAY, title: "Beginner CTF this Friday: who's in?", body: "Web + crypto challenges, teams of up to 3. Good first CTF if you've never done one." },
    { key: "p9", club: "game", author: "zain", age: 7 * HOUR, title: "Game jam theme poll: 'Connected'?", body: "Fitting for the department. Other ideas welcome below." },
  ] as const;
  const insertedPosts = await db
    .insert(s.posts)
    .values(
      postDefs.map((p) => ({
        clubId: c[p.club],
        authorId: u[p.author],
        title: p.title,
        body: p.body,
        linkUrl: "link" in p ? p.link : null,
        isPinned: "pinned" in p ? p.pinned : false,
        createdAt: ago(p.age),
      })),
    )
    .returning({ id: s.posts.id, title: s.posts.title });
  const p = Object.fromEntries(postDefs.map((d) => [d.key, insertedPosts.find((x) => x.title === d.title)!.id])) as Record<
    (typeof postDefs)[number]["key"],
    string
  >;

  const [c1] = await db
    .insert(s.comments)
    .values({ postId: p.p2, authorId: u.hira, body: "I'm in. Can we also go over dropout vs. weight decay? I keep mixing them up.", createdAt: ago(4 * HOUR) })
    .returning({ id: s.comments.id });
  const [c2] = await db
    .insert(s.comments)
    .values({ postId: p.p2, authorId: u.ayesha, parentId: c1.id, body: "Yes! Dropout zeroes activations randomly during training; weight decay penalises large weights. I'll prepare a one-pager.", createdAt: ago(3 * HOUR) })
    .returning({ id: s.comments.id });
  await db.insert(s.comments).values([
    { postId: p.p2, authorId: u.hamza, parentId: c2.id, body: "Booked the discussion room for 11:00 on Saturday.", createdAt: ago(2 * HOUR) },
    { postId: p.p2, authorId: u.usman, body: "Count me in for the CNN part.", createdAt: ago(90 * 60_000) },
    { postId: p.p4, authorId: u.zain, body: "For E I used binary search on the answer plus a greedy check. O(n log n) passed comfortably.", createdAt: ago(6 * HOUR) },
    { postId: p.p6, authorId: u.hira, body: "Next.js + Postgres, happy to review anything React.", createdAt: ago(20 * HOUR) },
    { postId: p.p8, authorId: u.usman, body: "Team slots are open. Reply here and I'll add you.", createdAt: ago(1 * DAY) },
  ]);

  const votes: [keyof typeof p, keyof typeof u, 1 | -1][] = [
    ["p1", "ayesha", 1], ["p1", "hira", 1], ["p1", "usman", 1], ["p1", "fatima", 1],
    ["p2", "hira", 1], ["p2", "usman", 1], ["p2", "hamza", 1],
    ["p3", "ayesha", 1], ["p3", "hamza", 1], ["p3", "fatima", 1], ["p3", "usman", 1], ["p3", "hira", 1],
    ["p4", "zain", 1], ["p4", "hamza", 1],
    ["p5", "usman", 1],
    ["p6", "hira", 1], ["p6", "hamza", 1], ["p6", "ayesha", -1],
    ["p8", "zain", 1], ["p8", "usman", 1],
  ];
  await db.insert(s.postVotes).values(votes.map(([post, user, value]) => ({ postId: p[post], userId: u[user], value })));
  await db.insert(s.bookmarks).values([{ userId: u.ayesha, postId: p.p3 }, { userId: u.ayesha, postId: p.p7 }]);

  await db.insert(s.clubRequests).values([
    { name: "Robotics & IoT", description: "Arduino, Raspberry Pi and embedded projects with a focus on campus sensors.", reason: "Several of us already meet informally in the hardware lab and want an official space to share builds.", requestedBy: u.fatima, createdAt: ago(5 * HOUR) },
    { name: "Data Science Circle", description: "Kaggle competitions, data visualisation and analytics projects.", reason: "AI & ML is very theory-heavy; this would focus on practical data work and competitions.", requestedBy: u.ayesha, createdAt: ago(1 * DAY) },
    { name: "Meme Lords", description: "Programming memes.", reason: "For fun.", requestedBy: u.zain, status: "rejected", reviewedBy: u.headgr, reviewedAt: ago(2 * DAY), reviewNote: "Please keep memes in the club they relate to.", createdAt: ago(3 * DAY) },
  ]);

  await db.insert(s.announcements).values([
    { authorId: u.hod, title: "Mid-term examination schedule published", body: "The mid-term examination schedule for all CS sections is now final. Exams run from Monday to Friday next week. Check your section's room allocation and reach the exam hall 15 minutes early with your university ID card.", linkUrl: "https://example.edu/cs/midterm-schedule", createdAt: ago(3 * HOUR) },
    { authorId: u.headcr, title: "Class representatives meeting: Wednesday", body: "All section CRs are requested to attend the monthly meeting in Seminar Room 2. Bring your section's pending academic issues so we can forward them to the department.", createdAt: ago(1 * DAY + 2 * HOUR) },
    { authorId: u.headgr, title: "Girls' common room renovation complete", body: "The CS block girls' common room is open again with new seating and charging points. Please help keep it clean.", createdAt: ago(4 * DAY) },
  ]);

  await db.insert(s.events).values([
    { title: "Campus Connect Webathon", description: "Four-hour web development challenge for CS students, followed by an hour for hosting.", venue: "CS Lab 1 & 2", startsAt: pkt(0, 17), createdBy: u.headcr },
    { title: "Industry talk: Shipping ML to production", description: "A senior ML engineer shares lessons from deploying models at scale, with Q&A.", venue: "Auditorium A", startsAt: pkt(3, 14), createdBy: u.hod },
    { title: "ICPC team trials", description: "Five-hour individual contest to select the department's regional ICPC teams.", venue: "CS Lab 3", startsAt: pkt(8, 10), createdBy: u.headcr },
    { title: "Career fair prep workshop", description: "CV reviews and mock interviews with alumni.", venue: "Seminar Room 2", startsAt: pkt(12, 15, 30), createdBy: u.headgr, status: "cancelled" },
    { title: "Freshers' orientation", description: "Welcome session for new CS students: department tour, clubs introduction and faculty meet-and-greet.", venue: "Auditorium A", startsAt: pkt(-20, 10), createdBy: u.hod },
    { title: "Git & GitHub hands-on session", description: "From first commit to pull requests, run by the Web Dev Guild.", venue: "CS Lab 2", startsAt: pkt(-6, 13), createdBy: u.headcr },
  ]);

  console.log(`Seeded. Demo password for every account: ${DEMO_PASSWORD}`);
}

async function main() {
  const client = postgres(getDatabaseUrl(), { max: 1, prepare: false });
  await seedDatabase(drizzle(client, { schema: s }) as unknown as AnyPgDb);
  await client.end();
}

// Only run when executed directly (not when imported by seed-http.ts).
if (process.argv[1]?.includes("seed.ts")) main().catch((err) => {
  console.error(err);
  process.exit(1);
});
