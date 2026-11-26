"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, bookmarks, clubs, comments, postVotes, posts } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/current-user";
import { canModerateClub, canParticipateInClub } from "@/lib/auth/permissions";
import { saveAttachment } from "@/lib/attachments";
import { commentSchema, postSchema } from "@/lib/validation";
import { ForbiddenError, validationFailure, type ActionState } from "@/lib/action-result";

async function signedInUser() {
  const user = await getCurrentUser();
  if (!user) throw new ForbiddenError("Please sign in first.");
  return user;
}

async function getPostOrThrow(postId: string) {
  const [post] = await db
    .select({ id: posts.id, clubId: posts.clubId, authorId: posts.authorId, isPinned: posts.isPinned })
    .from(posts)
    .where(eq(posts.id, postId));
  if (!post) throw new Error("Post not found");
  return post;
}

// ── Posts ────────────────────────────────────────────────────────────────────
export async function createPost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await signedInUser();
  const parsed = postSchema.safeParse({
    clubId: formData.get("clubId"),
    title: formData.get("title"),
    body: formData.get("body"),
    linkUrl: formData.get("linkUrl"),
  });
  if (!parsed.success) return validationFailure(parsed.error);
  const { clubId, title, body, linkUrl } = parsed.data;

  if (!(await canParticipateInClub(user, clubId))) return { ok: false, message: "Join this club to post in it." };

  const file = formData.get("attachment");
  const hasFile = file instanceof File && file.size > 0;
  if (!body && !linkUrl && !hasFile) return { ok: false, fieldErrors: { body: ["Add some text, a link or a file"] } };

  const upload = await saveAttachment(file, user.id);
  if (!upload.ok) return { ok: false, fieldErrors: { attachment: [upload.error] } };

  const [post] = await db
    .insert(posts)
    .values({ clubId, authorId: user.id, title, body, linkUrl, attachmentId: upload.id })
    .returning({ id: posts.id });
  revalidatePath("/", "layout");
  redirect(`/posts/${post.id}`);
}

const postIdSchema = z.object({ postId: z.uuid() });

export async function deletePost(formData: FormData) {
  const user = await signedInUser();
  const { postId } = postIdSchema.parse(Object.fromEntries(formData));
  const post = await getPostOrThrow(postId);
  const allowed = post.authorId === user.id || (await canModerateClub(user, post.clubId));
  if (!allowed) throw new ForbiddenError("Only the author or this club's moderators can delete this post.");

  const [club] = await db.select({ slug: clubs.slug }).from(clubs).where(eq(clubs.id, post.clubId));
  await db.delete(posts).where(eq(posts.id, postId));
  revalidatePath("/", "layout");
  redirect(`/clubs/${club.slug}`);
}

export async function togglePin(formData: FormData) {
  const user = await signedInUser();
  const { postId } = postIdSchema.parse(Object.fromEntries(formData));
  const post = await getPostOrThrow(postId);
  if (!(await canModerateClub(user, post.clubId))) throw new ForbiddenError("Only this club's moderators can pin posts.");
  await db.update(posts).set({ isPinned: !post.isPinned }).where(eq(posts.id, postId));
  revalidatePath("/", "layout");
}

// ── Votes & bookmarks ───────────────────────────────────────────────────────
const voteSchema = z.object({ postId: z.uuid(), value: z.coerce.number().pipe(z.union([z.literal(1), z.literal(-1)])) });

export async function vote(formData: FormData) {
  const user = await signedInUser();
  const { postId, value } = voteSchema.parse(Object.fromEntries(formData));
  const post = await getPostOrThrow(postId);
  if (!(await canParticipateInClub(user, post.clubId))) return; // UI disables voting for non-members

  const where = and(eq(postVotes.postId, postId), eq(postVotes.userId, user.id));
  const [existing] = await db.select({ value: postVotes.value }).from(postVotes).where(where);
  if (existing?.value === value) {
    await db.delete(postVotes).where(where); // clicking the same arrow again removes the vote
  } else {
    await db
      .insert(postVotes)
      .values({ postId, userId: user.id, value })
      .onConflictDoUpdate({ target: [postVotes.postId, postVotes.userId], set: { value } });
  }
  revalidatePath("/", "layout");
}

export async function toggleBookmark(formData: FormData) {
  const user = await signedInUser();
  const { postId } = postIdSchema.parse(Object.fromEntries(formData));
  const where = and(eq(bookmarks.postId, postId), eq(bookmarks.userId, user.id));
  const [existing] = await db.select({ postId: bookmarks.postId }).from(bookmarks).where(where);
  if (existing) await db.delete(bookmarks).where(where);
  else await db.insert(bookmarks).values({ postId, userId: user.id });
  revalidatePath("/", "layout");
}

// ── Comments ────────────────────────────────────────────────────────────────
export async function createComment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await signedInUser();
  const parsed = commentSchema.safeParse({
    postId: formData.get("postId"),
    parentId: formData.get("parentId") || null,
    body: formData.get("body"),
  });
  if (!parsed.success) return validationFailure(parsed.error);
  const { postId, parentId, body } = parsed.data;

  const post = await getPostOrThrow(postId);
  if (!(await canParticipateInClub(user, post.clubId))) return { ok: false, message: "Join this club to comment." };

  if (parentId) {
    const [parent] = await db.select({ postId: comments.postId }).from(comments).where(eq(comments.id, parentId));
    if (!parent || parent.postId !== postId) return { ok: false, message: "That comment no longer exists." };
  }

  await db.insert(comments).values({ postId, parentId, authorId: user.id, body });
  revalidatePath(`/posts/${postId}`);
  return { ok: true };
}

export async function deleteComment(formData: FormData) {
  const user = await signedInUser();
  const { commentId } = z.object({ commentId: z.uuid() }).parse(Object.fromEntries(formData));
  const [comment] = await db
    .select({ authorId: comments.authorId, postId: comments.postId, clubId: posts.clubId })
    .from(comments)
    .innerJoin(posts, eq(posts.id, comments.postId))
    .where(eq(comments.id, commentId));
  if (!comment) return;
  const allowed = comment.authorId === user.id || (await canModerateClub(user, comment.clubId));
  if (!allowed) throw new ForbiddenError("Only the author or this club's moderators can delete this comment.");
  await db.delete(comments).where(eq(comments.id, commentId)); // replies cascade
  revalidatePath(`/posts/${comment.postId}`);
}
