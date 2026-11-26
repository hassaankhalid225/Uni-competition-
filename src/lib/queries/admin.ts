import "server-only";
import { asc, desc, eq, ne } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db, clubModerators, clubRequests, clubs, users } from "@/lib/db";

const reviewer = alias(users, "reviewer");

export async function listClubRequests() {
  return db
    .select({
      id: clubRequests.id,
      name: clubRequests.name,
      description: clubRequests.description,
      reason: clubRequests.reason,
      status: clubRequests.status,
      reviewNote: clubRequests.reviewNote,
      createdAt: clubRequests.createdAt,
      reviewedAt: clubRequests.reviewedAt,
      requesterName: users.name,
      requesterEmail: users.email,
      reviewerName: reviewer.name,
    })
    .from(clubRequests)
    .innerJoin(users, eq(users.id, clubRequests.requestedBy))
    .leftJoin(reviewer, eq(reviewer.id, clubRequests.reviewedBy))
    .orderBy(desc(clubRequests.createdAt));
}

export async function listClubsWithModerators() {
  const rows = await db
    .select({ clubId: clubs.id, clubName: clubs.name, clubSlug: clubs.slug, modId: users.id, modName: users.name })
    .from(clubs)
    .leftJoin(clubModerators, eq(clubModerators.clubId, clubs.id))
    .leftJoin(users, eq(users.id, clubModerators.userId))
    .orderBy(asc(clubs.name), asc(users.name));

  const map = new Map<string, { id: string; name: string; slug: string; moderators: { id: string; name: string }[] }>();
  for (const r of rows) {
    if (!map.has(r.clubId)) map.set(r.clubId, { id: r.clubId, name: r.clubName, slug: r.clubSlug, moderators: [] });
    if (r.modId && r.modName) map.get(r.clubId)!.moderators.push({ id: r.modId, name: r.modName });
  }
  return [...map.values()];
}

export async function listStudents() {
  return db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(ne(users.role, "admin"))
    .orderBy(asc(users.name));
}
