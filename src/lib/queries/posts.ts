import "server-only";
import { and, desc, eq, inArray, sql, type SQL } from "drizzle-orm";
import { db, attachments, bookmarks, clubMembers, clubs, comments, posts, users } from "@/lib/db";

export type FeedSort = "new" | "top";

type FeedOptions = {
  viewerId: string;
  clubId?: string;
  onlyJoinedClubs?: boolean;
  onlyBookmarked?: boolean;
  sort?: FeedSort;
  limit?: number;
};

// Aggregates are correlated subqueries with fully qualified names (see note in clubs.ts). They stay
// fast thanks to the composite primary keys / indexes on post_votes, comments and bookmarks.
const score = sql<number>`coalesce((select sum(v.value) from post_votes v where v.post_id = "posts"."id"), 0)::int`;
const commentCount = sql<number>`(select count(*) from comments c where c.post_id = "posts"."id")::int`;

function viewerFields(viewerId: string) {
  return {
    myVote: sql<number>`coalesce((select v.value from post_votes v where v.post_id = "posts"."id" and v.user_id = ${viewerId}), 0)::int`,
    isBookmarked: sql<boolean>`exists(select 1 from bookmarks b where b.post_id = "posts"."id" and b.user_id = ${viewerId})`,
    // Member or moderator of the post's club (admins are handled by the caller).
    canParticipate: sql<boolean>`(exists(select 1 from club_members cm where cm.club_id = "posts"."club_id" and cm.user_id = ${viewerId}) or exists(select 1 from club_moderators m where m.club_id = "posts"."club_id" and m.user_id = ${viewerId}))`,
  };
}

const postColumns = {
  id: posts.id,
  title: posts.title,
  body: posts.body,
  linkUrl: posts.linkUrl,
  isPinned: posts.isPinned,
  createdAt: posts.createdAt,
  authorId: posts.authorId,
  authorName: users.name,
  authorAvatar: users.avatarUrl,
  clubId: clubs.id,
  clubName: clubs.name,
  clubSlug: clubs.slug,
  attachmentId: attachments.id,
  attachmentName: attachments.fileName,
  attachmentType: attachments.mimeType,
  attachmentSize: attachments.sizeBytes,
  score,
  commentCount,
};

export async function listPosts(opts: FeedOptions) {
  const filters: SQL[] = [];
  if (opts.clubId) filters.push(eq(posts.clubId, opts.clubId));
  if (opts.onlyJoinedClubs)
    filters.push(
      inArray(posts.clubId, db.select({ id: clubMembers.clubId }).from(clubMembers).where(eq(clubMembers.userId, opts.viewerId))),
    );
  if (opts.onlyBookmarked)
    filters.push(
      inArray(posts.id, db.select({ id: bookmarks.postId }).from(bookmarks).where(eq(bookmarks.userId, opts.viewerId))),
    );

  // Pinned posts float to the top only inside a single club's feed.
  const order = [
    ...(opts.clubId ? [desc(posts.isPinned)] : []),
    ...(opts.sort === "top" ? [desc(score)] : []),
    desc(posts.createdAt),
  ];

  return db
    .select({ ...postColumns, ...viewerFields(opts.viewerId) })
    .from(posts)
    .innerJoin(users, eq(users.id, posts.authorId))
    .innerJoin(clubs, eq(clubs.id, posts.clubId))
    .leftJoin(attachments, eq(attachments.id, posts.attachmentId))
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(...order)
    .limit(opts.limit ?? 50);
}

export type FeedPost = Awaited<ReturnType<typeof listPosts>>[number];

export async function getPost(postId: string, viewerId: string) {
  const [post] = await db
    .select({ ...postColumns, ...viewerFields(viewerId) })
    .from(posts)
    .innerJoin(users, eq(users.id, posts.authorId))
    .innerJoin(clubs, eq(clubs.id, posts.clubId))
    .leftJoin(attachments, eq(attachments.id, posts.attachmentId))
    .where(eq(posts.id, postId));
  return post ?? null;
}

export type CommentNode = {
  id: string;
  body: string;
  createdAt: Date;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  replies: CommentNode[];
};

/** Loads all comments of a post in one query and assembles the reply tree in memory. */
export async function getCommentTree(postId: string): Promise<CommentNode[]> {
  const rows = await db
    .select({
      id: comments.id,
      parentId: comments.parentId,
      body: comments.body,
      createdAt: comments.createdAt,
      authorId: comments.authorId,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
    })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.authorId))
    .where(eq(comments.postId, postId))
    .orderBy(comments.createdAt);

  const byId = new Map<string, CommentNode>();
  for (const r of rows) byId.set(r.id, { ...r, replies: [] });
  const roots: CommentNode[] = [];
  for (const r of rows) {
    const node = byId.get(r.id)!;
    const parent = r.parentId ? byId.get(r.parentId) : undefined;
    if (parent) parent.replies.push(node);
    else roots.push(node);
  }
  return roots;
}
