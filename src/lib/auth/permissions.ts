import "server-only";
import { and, eq } from "drizzle-orm";
import { db, clubMembers, clubModerators } from "@/lib/db";
import type { SessionUser } from "./current-user";

// Single place where "who may do what" is decided. Every server action calls these.
//   Admin (Head CR / Head GR / HOD) → platform-wide access.
//   Moderator → content management inside the clubs they are assigned to, nothing else.
//   Student → participate in clubs they have joined.

export const isAdmin = (user: SessionUser | null) => user?.role === "admin";

export async function isModeratorOf(userId: string, clubId: string) {
  const rows = await db
    .select({ userId: clubModerators.userId })
    .from(clubModerators)
    .where(and(eq(clubModerators.clubId, clubId), eq(clubModerators.userId, userId)))
    .limit(1);
  return rows.length > 0;
}

export async function isMemberOf(userId: string, clubId: string) {
  const rows = await db
    .select({ userId: clubMembers.userId })
    .from(clubMembers)
    .where(and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, userId)))
    .limit(1);
  return rows.length > 0;
}

/** Can delete any post/comment and pin posts in this club. */
export async function canModerateClub(user: SessionUser, clubId: string) {
  return isAdmin(user) || (await isModeratorOf(user.id, clubId));
}

/** Can post, comment, reply and vote in this club. */
export async function canParticipateInClub(user: SessionUser, clubId: string) {
  return isAdmin(user) || (await isMemberOf(user.id, clubId)) || (await isModeratorOf(user.id, clubId));
}
