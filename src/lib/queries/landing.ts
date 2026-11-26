import "server-only";
import { and, asc, count, desc, eq, gte, sql } from "drizzle-orm";
import { db, clubModerators, clubs, events, posts, users, type SubSocietyFocus } from "@/lib/db";
import { listClubSubSocieties } from "@/lib/queries/clubs";

/** Real numbers for the landing page, read live from the database. */
export async function getLandingStats() {
  const [[c], [s], [p], [e]] = await Promise.all([
    db.select({ n: count() }).from(clubs),
    db.select({ n: count() }).from(users).where(eq(users.role, "student")),
    db.select({ n: count() }).from(posts),
    db.select({ n: count() }).from(events).where(and(gte(events.startsAt, new Date()), eq(events.status, "scheduled"))),
  ]);
  return { clubs: c.n, students: s.n, discussions: p.n, upcomingEvents: e.n };
}

export async function getLandingClubs() {
  return db
    .select({
      name: clubs.name,
      slug: clubs.slug,
      description: clubs.description,
      members: sql<number>`(select count(*) from club_members cm where cm.club_id = "clubs"."id")::int`,
      wings: sql<SubSocietyFocus[]>`array(select ss.focus::text from sub_societies ss where ss.club_id = "clubs"."id" order by ss.focus)`,
    })
    .from(clubs)
    .orderBy(asc(clubs.name))
    .limit(12);
}

const PUBLIC_RECENT_POSTS = 5;

/** Public club profile for the landing page. Counts only; no member identities beyond moderators. */
export async function getPublicClub(slug: string) {
  const [club] = await db
    .select({
      id: clubs.id,
      slug: clubs.slug,
      name: clubs.name,
      description: clubs.description,
      createdAt: clubs.createdAt,
      memberCount: sql<number>`(select count(*) from club_members cm where cm.club_id = "clubs"."id")::int`,
      postCount: sql<number>`(select count(*) from posts p where p.club_id = "clubs"."id")::int`,
    })
    .from(clubs)
    .where(eq(clubs.slug, slug));
  if (!club) return null;

  const [moderators, recentPosts, subSocieties] = await Promise.all([
    db
      .select({ name: users.name })
      .from(clubModerators)
      .innerJoin(users, eq(users.id, clubModerators.userId))
      .where(eq(clubModerators.clubId, club.id))
      .orderBy(asc(users.name)),
    // Titles only: post bodies stay behind sign-in.
    db
      .select({ id: posts.id, title: posts.title, isPinned: posts.isPinned, createdAt: posts.createdAt, author: users.name })
      .from(posts)
      .innerJoin(users, eq(users.id, posts.authorId))
      .where(eq(posts.clubId, club.id))
      .orderBy(desc(posts.createdAt))
      .limit(PUBLIC_RECENT_POSTS),
    listClubSubSocieties(club.id),
  ]);

  return { ...club, moderators: moderators.map((m) => m.name), recentPosts, subSocieties };
}
