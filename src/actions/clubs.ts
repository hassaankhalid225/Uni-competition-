"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, clubMembers, clubModerators, clubRequests } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/current-user";
import { clubRequestSchema } from "@/lib/validation";
import { ForbiddenError, validationFailure, type ActionState } from "@/lib/action-result";

const clubIdSchema = z.object({ clubId: z.uuid() });

async function signedInUser() {
  const user = await getCurrentUser();
  if (!user) throw new ForbiddenError("Please sign in first.");
  return user;
}

export async function joinClub(formData: FormData) {
  const user = await signedInUser();
  const { clubId } = clubIdSchema.parse(Object.fromEntries(formData));
  await db.insert(clubMembers).values({ clubId, userId: user.id }).onConflictDoNothing();
  revalidatePath("/", "layout");
}

export async function leaveClub(formData: FormData) {
  const user = await signedInUser();
  const { clubId } = clubIdSchema.parse(Object.fromEntries(formData));
  // Moderators must be unassigned by an admin first, so a club never silently loses its moderator.
  const isMod = await db
    .select({ userId: clubModerators.userId })
    .from(clubModerators)
    .where(and(eq(clubModerators.clubId, clubId), eq(clubModerators.userId, user.id)));
  if (isMod.length) throw new ForbiddenError("Moderators can't leave their club. Ask an admin to unassign you first.");
  await db.delete(clubMembers).where(and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, user.id)));
  revalidatePath("/", "layout");
}

export async function requestClub(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await signedInUser();
  const parsed = clubRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationFailure(parsed.error);

  const pending = await db
    .select({ id: clubRequests.id })
    .from(clubRequests)
    .where(and(eq(clubRequests.requestedBy, user.id), eq(clubRequests.status, "pending")));
  if (pending.length >= 3) return { ok: false, message: "You already have 3 pending requests. Wait for a decision first." };

  await db.insert(clubRequests).values({ ...parsed.data, requestedBy: user.id });
  revalidatePath("/clubs/request");
  revalidatePath("/admin");
  return { ok: true, message: "Request sent. Admins will review it soon." };
}
