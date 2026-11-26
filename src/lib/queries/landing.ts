import "server-only";
import { asc, count, eq, gte, sql } from "drizzle-orm";
import { db, clubs, events, posts, users } from "@/lib/db";

/** Real numbers for the landing page, read live from the database. */
export async function getLandingStats() {
  const [[c], [s], [p], [e]] = await Promise.all([
    db.select({ n: count() }).from(clubs),
    db.select({ n: count() }).from(users).where(eq(users.role, "student")),
    db.select({ n: count() }).from(posts),
    db.select({ n: count() }).from(events).where(gte(events.startsAt, new Date())),
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
    })
    .from(clubs)
    .orderBy(asc(clubs.name))
    .limit(12);
}
