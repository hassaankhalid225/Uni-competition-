"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, announcements, events } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/current-user";
import { isAdmin } from "@/lib/auth/permissions";
import { saveAttachment } from "@/lib/attachments";
import { announcementSchema, eventSchema } from "@/lib/validation";
import { toUtcDate } from "@/lib/format";
import { ForbiddenError, validationFailure, type ActionState } from "@/lib/action-result";

async function adminUser() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) throw new ForbiddenError("Only admins (Head CR, Head GR, HOD) can do this.");
  return user;
}

// ── Announcements ───────────────────────────────────────────────────────────
export async function publishAnnouncement(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await adminUser();
  const parsed = announcementSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    linkUrl: formData.get("linkUrl"),
  });
  if (!parsed.success) return validationFailure(parsed.error);

  const upload = await saveAttachment(formData.get("attachment"), admin.id);
  if (!upload.ok) return { ok: false, fieldErrors: { attachment: [upload.error] } };

  await db.insert(announcements).values({ ...parsed.data, attachmentId: upload.id, authorId: admin.id });
  revalidatePath("/", "layout");
  redirect("/announcements");
}

export async function deleteAnnouncement(formData: FormData) {
  await adminUser();
  const { id } = z.object({ id: z.uuid() }).parse(Object.fromEntries(formData));
  await db.delete(announcements).where(eq(announcements.id, id));
  revalidatePath("/", "layout");
}

// ── Events ──────────────────────────────────────────────────────────────────
function parseEvent(formData: FormData) {
  return eventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    venue: formData.get("venue"),
    date: formData.get("date"),
    time: formData.get("time"),
  });
}

export async function createEvent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await adminUser();
  const parsed = parseEvent(formData);
  if (!parsed.success) return validationFailure(parsed.error);
  const { date, time, ...rest } = parsed.data;
  await db.insert(events).values({ ...rest, startsAt: toUtcDate(date, time), createdBy: admin.id });
  revalidatePath("/", "layout");
  redirect("/events");
}

export async function updateEvent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await adminUser();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return { ok: false, message: "Event not found." };
  const parsed = parseEvent(formData);
  if (!parsed.success) return validationFailure(parsed.error);
  const { date, time, ...rest } = parsed.data;
  await db
    .update(events)
    .set({ ...rest, startsAt: toUtcDate(date, time), updatedAt: new Date() })
    .where(eq(events.id, id.data));
  revalidatePath("/", "layout");
  redirect("/events");
}

export async function setEventStatus(formData: FormData) {
  await adminUser();
  const { id, status } = z
    .object({ id: z.uuid(), status: z.enum(["scheduled", "cancelled"]) })
    .parse(Object.fromEntries(formData));
  await db.update(events).set({ status, updatedAt: new Date() }).where(eq(events.id, id));
  revalidatePath("/", "layout");
}
