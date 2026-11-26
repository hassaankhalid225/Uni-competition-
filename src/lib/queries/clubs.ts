import "server-only";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db, clubMembers, clubModerators, clubRequests, clubs, users } from "@/lib/db";

// Correlated subqueries use fully qualified names: on single-table selects Drizzle emits bare
// column names, and an unqualified "id" inside a subquery would bind to the inner table.
const memberCount = sql<number>`(select count(*) from club_members cm where cm.club_id = "clubs"."id")::int`;
const postCount = sql<number>`(select count(*) from posts p where p.club_id = "clubs"."id")::int`;

function viewerFlags(viewerId: string) {
  return {
    isMember: sql<boolean>`exists(select 1 from club_members cm where cm.club_id = "clubs"."id" and cm.user_id = ${viewerId})`,
    isModerator: sql<boolean>`exists(select 1 from club_moderators m where m.club_id = "clubs"."id" and m.user_id = ${viewerId})`,
  };
}

export async function listClubs(viewerId: string) {
  return db
    .select({
      id: clubs.id,
      slug: clubs.slug,
      name: clubs.name,
      description: clubs.description,
      memberCount,
      postCount,
      ...viewerFlags(viewerId),
    })
    .from(clubs)
    .orderBy(desc(memberCount), asc(clubs.name));
}

export type ClubSummary = Awaited<ReturnType<typeof listClubs>>[number];

export async function listMyClubs(viewerId: string) {
  return db
    .select({ id: clubs.id, slug: clubs.slug, name: clubs.name })
    .from(clubs)
    .innerJoin(clubMembers, and(eq(clubMembers.clubId, clubs.id), eq(clubMembers.userId, viewerId)))
    .orderBy(asc(clubs.name));
}

export async function getClubBySlug(slug: string, viewerId: string) {
  const [club] = await db
    .select({
      id: clubs.id,
      slug: clubs.slug,
      name: clubs.name,
      description: clubs.description,
      createdAt: clubs.createdAt,
      memberCount,
      postCount,
      ...viewerFlags(viewerId),
    })
    .from(clubs)
    .where(eq(clubs.slug, slug));
  return club ?? null;
}

export async function listClubModerators(clubId: string) {
  return db
    .select({ id: users.id, name: users.name })
    .from(clubModerators)
    .innerJoin(users, eq(users.id, clubModerators.userId))
    .where(eq(clubModerators.clubId, clubId))
    .orderBy(asc(users.name));
}

export async function listMyClubRequests(userId: string) {
  return db
    .select({
      id: clubRequests.id,
      name: clubRequests.name,
      status: clubRequests.status,
      reviewNote: clubRequests.reviewNote,
      createdAt: clubRequests.createdAt,
      clubSlug: clubs.slug,
    })
    .from(clubRequests)
    .leftJoin(clubs, eq(clubs.id, clubRequests.clubId))
    .where(eq(clubRequests.requestedBy, userId))
    .orderBy(desc(clubRequests.createdAt));
}
