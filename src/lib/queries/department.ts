import "server-only";
import { asc, desc, eq, gte, lt } from "drizzle-orm";
import { db, announcements, attachments, events, users } from "@/lib/db";

export async function listAnnouncements(limit = 50) {
  return db
    .select({
      id: announcements.id,
      title: announcements.title,
      body: announcements.body,
      linkUrl: announcements.linkUrl,
      createdAt: announcements.createdAt,
      authorName: users.name,
      authorTitle: users.adminTitle,
      attachmentId: attachments.id,
      attachmentName: attachments.fileName,
      attachmentType: attachments.mimeType,
      attachmentSize: attachments.sizeBytes,
    })
    .from(announcements)
    .leftJoin(users, eq(users.id, announcements.authorId))
    .leftJoin(attachments, eq(attachments.id, announcements.attachmentId))
    .orderBy(desc(announcements.createdAt))
    .limit(limit);
}

export type Announcement = Awaited<ReturnType<typeof listAnnouncements>>[number];

const eventColumns = {
  id: events.id,
  title: events.title,
  description: events.description,
  venue: events.venue,
  startsAt: events.startsAt,
  status: events.status,
};

export async function listUpcomingEvents(limit = 50) {
  return db.select(eventColumns).from(events).where(gte(events.startsAt, new Date())).orderBy(asc(events.startsAt)).limit(limit);
}

export async function listPastEvents(limit = 50) {
  return db.select(eventColumns).from(events).where(lt(events.startsAt, new Date())).orderBy(desc(events.startsAt)).limit(limit);
}

export type DeptEvent = Awaited<ReturnType<typeof listUpcomingEvents>>[number];

export async function getEvent(id: string) {
  const [row] = await db.select(eventColumns).from(events).where(eq(events.id, id));
  return row ?? null;
}
