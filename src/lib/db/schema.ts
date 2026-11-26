import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  smallint,
  primaryKey,
  index,
  check,
  unique,
  customType,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ── Enums ────────────────────────────────────────────────────────────────────
export const userRole = pgEnum("user_role", ["student", "admin"]);
export const requestStatus = pgEnum("request_status", ["pending", "approved", "rejected"]);
export const eventStatus = pgEnum("event_status", ["scheduled", "cancelled"]);
// Order here is the display order of a club's wings.
export const subSocietyFocus = pgEnum("sub_society_focus", ["media", "graphics", "coding", "events"]);

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => "bytea",
});

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
};

// ── Users ────────────────────────────────────────────────────────────────────
// Email + password accounts store a bcrypt hash here; Google accounts (via Supabase OAuth) have
// no password and are linked by email. The platform role is student or admin. Admins carry a title (Head CR, Head GR, HOD)
// but all titles share identical access. Moderation is club-scoped (see clubModerators).
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  // bcrypt hash for email + password sign-in; null for Google-only accounts.
  passwordHash: text("password_hash"),
  role: userRole("role").notNull().default("student"),
  adminTitle: text("admin_title"),
  // Profile photo from the sign-in provider (e.g. Google), refreshed on each sign-in.
  avatarUrl: text("avatar_url"),
  ...timestamps,
});

// ── Clubs ────────────────────────────────────────────────────────────────────
export const clubs = pgTable("clubs", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  ...timestamps,
});

// Every club runs a fixed set of wings (Media, Graphics, Coding, Event Management).
export const subSocieties = pgTable(
  "sub_societies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clubId: uuid("club_id").notNull().references(() => clubs.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull(),
    focus: subSocietyFocus("focus").notNull(),
    ...timestamps,
  },
  (t) => [unique("sub_societies_club_name_key").on(t.clubId, t.name), index("sub_societies_club_idx").on(t.clubId)],
);

export const clubMembers = pgTable(
  "club_members",
  {
    clubId: uuid("club_id").notNull().references(() => clubs.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.clubId, t.userId] }), index("club_members_user_idx").on(t.userId)],
);

export const clubModerators = pgTable(
  "club_moderators",
  {
    clubId: uuid("club_id").notNull().references(() => clubs.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    assignedBy: uuid("assigned_by").references(() => users.id, { onDelete: "set null" }),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.clubId, t.userId] }), index("club_moderators_user_idx").on(t.userId)],
);

export const clubRequests = pgTable(
  "club_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    reason: text("reason").notNull(),
    requestedBy: uuid("requested_by").notNull().references(() => users.id, { onDelete: "cascade" }),
    status: requestStatus("status").notNull().default("pending"),
    reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewNote: text("review_note"),
    clubId: uuid("club_id").references(() => clubs.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (t) => [index("club_requests_status_idx").on(t.status, t.createdAt)],
);

// ── Attachments (stored in Postgres; ≤ 3 MB each) ───────────────────────────
export const attachments = pgTable("attachments", {
  id: uuid("id").primaryKey().defaultRandom(),
  uploadedBy: uuid("uploaded_by").references(() => users.id, { onDelete: "set null" }),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  data: bytea("data").notNull(),
  ...timestamps,
});

// ── Posts, comments, votes, bookmarks ───────────────────────────────────────
export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clubId: uuid("club_id").notNull().references(() => clubs.id, { onDelete: "cascade" }),
    authorId: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body"),
    linkUrl: text("link_url"),
    attachmentId: uuid("attachment_id").references(() => attachments.id, { onDelete: "set null" }),
    isPinned: boolean("is_pinned").notNull().default(false),
    ...timestamps,
  },
  (t) => [index("posts_club_created_idx").on(t.clubId, t.createdAt), index("posts_author_idx").on(t.authorId)],
);

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    authorId: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id").references((): AnyPgColumn => comments.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    ...timestamps,
  },
  (t) => [index("comments_post_idx").on(t.postId, t.createdAt)],
);

export const postVotes = pgTable(
  "post_votes",
  {
    postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    value: smallint("value").notNull(),
  },
  (t) => [primaryKey({ columns: [t.postId, t.userId] }), check("post_votes_value_check", sql`${t.value} in (-1, 1)`)],
);

export const bookmarks = pgTable(
  "bookmarks",
  {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => [primaryKey({ columns: [t.userId, t.postId] })],
);

// ── Department-wide: announcements & events ─────────────────────────────────
export const announcements = pgTable(
  "announcements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    linkUrl: text("link_url"),
    attachmentId: uuid("attachment_id").references(() => attachments.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (t) => [index("announcements_created_idx").on(t.createdAt)],
);

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    venue: text("venue").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    status: eventStatus("status").notNull().default("scheduled"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    ...timestamps,
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("events_starts_idx").on(t.startsAt)],
);

export type User = typeof users.$inferSelect;
export type SubSocietyFocus = (typeof subSocietyFocus.enumValues)[number];
