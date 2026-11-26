"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, clubs, clubMembers, clubModerators, clubRequests, users } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/current-user";
import { isAdmin } from "@/lib/auth/permissions";
import { reviewRequestSchema } from "@/lib/validation";
import { slugify } from "@/lib/format";
import { ForbiddenError, validationFailure, type ActionState } from "@/lib/action-result";

async function adminUser() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) throw new ForbiddenError("Only admins (Head CR, Head GR, HOD) can do this.");
  return user;
}

async function uniqueSlug(name: string) {
  const base = slugify(name) || "club";
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const taken = await db.select({ id: clubs.id }).from(clubs).where(eq(clubs.slug, candidate));
    if (!taken.length) return candidate;
  }
  return `${base}-${Date.now()}`;
}

export async function reviewClubRequest(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await adminUser();
  const parsed = reviewRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationFailure(parsed.error);
  const { requestId, decision, note } = parsed.data;

  const result = await db.transaction(async (tx) => {
    const [request] = await tx.select().from(clubRequests).where(eq(clubRequests.id, requestId)).for("update");
    if (!request) return { ok: false, message: "Request not found." };
    if (request.status !== "pending") return { ok: false, message: "This request was already reviewed." };

    let clubId: string | null = null;
    if (decision === "approved") {
      const [club] = await tx
        .insert(clubs)
        .values({ name: request.name, slug: await uniqueSlug(request.name), description: request.description, createdBy: request.requestedBy })
        .returning({ id: clubs.id });
      clubId = club.id;
      // The person who asked for the club becomes its first member.
      await tx.insert(clubMembers).values({ clubId, userId: request.requestedBy }).onConflictDoNothing();
    }
    await tx
      .update(clubRequests)
      .set({ status: decision, reviewedBy: admin.id, reviewedAt: new Date(), reviewNote: note, clubId })
      .where(eq(clubRequests.id, requestId));
    return { ok: true, message: decision === "approved" ? `“${request.name}” is now live.` : "Request rejected." };
  });

  revalidatePath("/", "layout");
  return result;
}

const moderatorSchema = z.object({ clubId: z.uuid(), userId: z.uuid() });

export async function assignModerator(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await adminUser();
  const parsed = moderatorSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Pick a club and a student." };
  const { clubId, userId } = parsed.data;

  const [target] = await db.select({ role: users.role, name: users.name }).from(users).where(eq(users.id, userId));
  if (!target) return { ok: false, message: "User not found." };
  if (target.role === "admin") return { ok: false, message: "Admins already manage every club." };

  await db.transaction(async (tx) => {
    await tx.insert(clubModerators).values({ clubId, userId, assignedBy: admin.id }).onConflictDoNothing();
    // A moderator is always a member of the club they moderate.
    await tx.insert(clubMembers).values({ clubId, userId }).onConflictDoNothing();
  });
  revalidatePath("/", "layout");
  return { ok: true, message: `${target.name} is now a moderator.` };
}

export async function removeModerator(formData: FormData) {
  await adminUser();
  const { clubId, userId } = moderatorSchema.parse(Object.fromEntries(formData));
  await db.delete(clubModerators).where(and(eq(clubModerators.clubId, clubId), eq(clubModerators.userId, userId)));
  revalidatePath("/", "layout");
}
