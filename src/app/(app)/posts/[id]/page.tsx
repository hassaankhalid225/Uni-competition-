import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pin, PinOff, Trash2 } from "lucide-react";
import { requireUser, type SessionUser } from "@/lib/auth/current-user";
import { canModerateClub, canParticipateInClub } from "@/lib/auth/permissions";
import { getCommentTree, getPost, type CommentNode } from "@/lib/queries/posts";
import { deleteComment, deletePost, togglePin } from "@/actions/posts";
import { formatDateTime, timeAgo } from "@/lib/format";
import { AttachmentLink, BookmarkButton, LinkPreview, VoteControl } from "@/components/post-card";
import { SubmitButton } from "@/components/forms";
import { Avatar, Badge, ClubMark } from "@/components/ui";
import { CommentForm, ReplyToggle } from "./comment-form";

export default async function PostPage({ params }: PageProps<"/posts/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const post = await getPost(id, user.id);
  if (!post) notFound();

  const [comments, canModerate, canParticipate] = await Promise.all([
    getCommentTree(post.id),
    canModerateClub(user, post.clubId),
    canParticipateInClub(user, post.clubId),
  ]);
  const canDelete = canModerate || post.authorId === user.id;
  const isImage = post.attachmentType?.startsWith("image/");

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/clubs/${post.clubSlug}`} className="mb-6 inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft size={16} />
        <ClubMark name={post.clubName} slug={post.clubSlug} size="sm" /> {post.clubName}
      </Link>

      <article className="flex gap-4 rounded-xl border border-line bg-surface p-5 sm:p-6">
        <VoteControl postId={post.id} score={post.score} myVote={post.myVote} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
            <Avatar name={post.authorName} src={post.authorAvatar} size="sm" />
            <span className="font-medium text-ink-soft">{post.authorName}</span>
            <span aria-hidden>·</span>
            <time dateTime={post.createdAt.toISOString()} title={formatDateTime(post.createdAt)}>
              {timeAgo(post.createdAt)}
            </time>
            {post.isPinned && (
              <Badge tone="accent">
                <Pin size={11} /> Pinned
              </Badge>
            )}
          </div>
          <h1 className="mt-3 font-display text-2xl font-semibold leading-snug sm:text-3xl">{post.title}</h1>
          {post.body && <p className="mt-4 whitespace-pre-line text-[16px] leading-relaxed text-ink-soft">{post.body}</p>}
          {isImage && post.attachmentId && (
            <a href={`/api/attachments/${post.attachmentId}`} target="_blank" rel="noopener" className="mt-4 block overflow-hidden rounded-lg border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element -- served from our own DB-backed route */}
              <img src={`/api/attachments/${post.attachmentId}`} alt={post.attachmentName ?? ""} className="w-full object-contain" />
            </a>
          )}
          {(post.linkUrl || (post.attachmentId && !isImage)) && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {post.linkUrl && <LinkPreview url={post.linkUrl} />}
              {post.attachmentId && !isImage && (
                <AttachmentLink id={post.attachmentId} name={post.attachmentName!} type={post.attachmentType!} size={post.attachmentSize!} />
              )}
            </div>
          )}

          <div className="-ml-2 mt-5 flex flex-wrap items-center gap-1 border-t border-line pt-3">
            <BookmarkButton postId={post.id} isBookmarked={post.isBookmarked} />
            {canModerate && (
              <form action={togglePin}>
                <input type="hidden" name="postId" value={post.id} />
                <SubmitButton variant="ghost" size="sm" className="font-normal">
                  {post.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                  {post.isPinned ? "Unpin" : "Pin to club"}
                </SubmitButton>
              </form>
            )}
            {canDelete && (
              <form action={deletePost}>
                <input type="hidden" name="postId" value={post.id} />
                <SubmitButton variant="danger" size="sm" className="font-normal" pendingLabel="Deleting…">
                  <Trash2 size={16} /> Delete{post.authorId !== user.id ? " (moderator)" : ""}
                </SubmitButton>
              </form>
            )}
          </div>
        </div>
      </article>

      <section aria-labelledby="comments-heading" className="mt-8">
        <h2 id="comments-heading" className="mb-4 font-display text-xl font-semibold">
          {post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}
        </h2>
        {canParticipate ? (
          <div className="mb-6 rounded-xl border border-line bg-surface p-4">
            <CommentForm postId={post.id} />
          </div>
        ) : (
          <p className="mb-6 rounded-xl border border-line bg-sunken px-4 py-3 text-sm text-ink-soft">
            <Link href={`/clubs/${post.clubSlug}`} className="font-medium text-accent hover:underline">
              Join {post.clubName}
            </Link>{" "}
            to join the discussion.
          </p>
        )}
        {comments.length === 0 ? (
          <p className="text-sm text-ink-muted">No comments yet. Start the conversation.</p>
        ) : (
          <ul className="flex flex-col gap-5">
            {comments.map((c) => (
              <Comment key={c.id} node={c} postId={post.id} user={user} canModerate={canModerate} canParticipate={canParticipate} depth={0} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

const MAX_INDENT = 4;

function Comment({ node, postId, user, canModerate, canParticipate, depth }: { node: CommentNode; postId: string; user: SessionUser; canModerate: boolean; canParticipate: boolean; depth: number }) {
  const canDelete = canModerate || node.authorId === user.id;
  return (
    <li>
      <div className="flex gap-3">
        <Avatar name={node.authorName} src={node.authorAvatar} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-ink-muted">
            <span className="font-medium text-ink-soft">{node.authorName}</span> · <time dateTime={node.createdAt.toISOString()}>{timeAgo(node.createdAt)}</time>
          </p>
          <p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed text-ink">{node.body}</p>
          <div className="-ml-1.5 mt-1 flex flex-wrap items-center gap-1">
            {canParticipate && <ReplyToggle postId={postId} parentId={node.id} />}
            {canDelete && (
              <form action={deleteComment}>
                <input type="hidden" name="commentId" value={node.id} />
                <button type="submit" className="rounded-md px-1.5 py-0.5 text-xs font-medium text-ink-muted hover:bg-danger-soft hover:text-danger">
                  Delete
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      {node.replies.length > 0 && (
        <ul className={depth < MAX_INDENT ? "ml-3 mt-4 flex flex-col gap-4 border-l-2 border-line pl-5" : "mt-4 flex flex-col gap-4"}>
          {node.replies.map((r) => (
            <Comment key={r.id} node={r} postId={postId} user={user} canModerate={canModerate} canParticipate={canParticipate} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}
