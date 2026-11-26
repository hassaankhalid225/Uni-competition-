import Link from "next/link";
import { ArrowBigDown, ArrowBigUp, Bookmark, BookmarkCheck, ExternalLink, MessageSquare, Paperclip, Pin } from "lucide-react";
import { toggleBookmark, vote } from "@/actions/posts";
import type { FeedPost } from "@/lib/queries/posts";
import { formatBytes, timeAgo } from "@/lib/format";
import { Badge, ClubMark, cx } from "./ui";
import { PendingButton } from "./pending-button";

export function VoteControl({ postId, score, myVote, orientation = "vertical", canVote = true }: { postId: string; score: number; myVote: number; orientation?: "vertical" | "horizontal"; canVote?: boolean }) {
  const lockedHint = canVote ? undefined : "Join this club to vote";
  return (
    <div className={cx("flex items-center", orientation === "vertical" ? "flex-col" : "flex-row gap-1")}>
      <form action={vote}>
        <input type="hidden" name="postId" value={postId} />
        <input type="hidden" name="value" value="1" />
        <PendingButton
          disabled={!canVote}
          title={lockedHint ?? "Upvote"}
          aria-label="Upvote"
          aria-pressed={myVote === 1}
          className={cx("rounded-md p-1 transition-colors hover:bg-accent-soft", myVote === 1 ? "text-accent" : "text-ink-muted hover:text-accent")}
        >
          <ArrowBigUp size={22} fill={myVote === 1 ? "currentColor" : "none"} />
        </PendingButton>
      </form>
      <span className={cx("min-w-6 text-center font-mono text-sm font-medium tabular-nums", myVote === 1 && "text-accent", myVote === -1 && "text-ink-soft")} aria-label={`Score ${score}`}>
        {score}
      </span>
      <form action={vote}>
        <input type="hidden" name="postId" value={postId} />
        <input type="hidden" name="value" value="-1" />
        <PendingButton
          disabled={!canVote}
          title={lockedHint ?? "Downvote"}
          aria-label="Downvote"
          aria-pressed={myVote === -1}
          className={cx("rounded-md p-1 transition-colors hover:bg-sunken", myVote === -1 ? "text-ink" : "text-ink-muted hover:text-ink")}
        >
          <ArrowBigDown size={22} fill={myVote === -1 ? "currentColor" : "none"} />
        </PendingButton>
      </form>
    </div>
  );
}

export function BookmarkButton({ postId, isBookmarked }: { postId: string; isBookmarked: boolean }) {
  return (
    <form action={toggleBookmark}>
      <input type="hidden" name="postId" value={postId} />
      <PendingButton
        aria-pressed={isBookmarked}
        className={cx("inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors hover:bg-sunken", isBookmarked ? "text-accent" : "text-ink-muted hover:text-ink")}
      >
        {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        {isBookmarked ? "Saved" : "Save"}
      </PendingButton>
    </form>
  );
}

export function AttachmentLink({ id, name, type, size }: { id: string; name: string; type: string; size: number }) {
  return (
    <a
      href={`/api/attachments/${id}`}
      target="_blank"
      rel="noopener"
      className="inline-flex max-w-full items-center gap-2 rounded-lg border border-line bg-sunken px-3 py-1.5 text-sm text-ink-soft hover:border-line-strong hover:text-ink"
    >
      <Paperclip size={14} className="shrink-0" />
      <span className="truncate">{name}</span>
      <span className="shrink-0 font-mono text-xs text-ink-muted">
        {type.split("/")[1]?.toUpperCase().slice(0, 4)} · {formatBytes(size)}
      </span>
    </a>
  );
}

export function LinkPreview({ url }: { url: string }) {
  let host = url;
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {}
  return (
    <a href={url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex max-w-full items-center gap-1.5 text-sm font-medium text-accent hover:underline">
      <ExternalLink size={14} className="shrink-0" />
      <span className="truncate">{host}</span>
    </a>
  );
}

export function PostCard({ post, showClub = true, isAdmin = false }: { post: FeedPost; showClub?: boolean; isAdmin?: boolean }) {
  const isImage = post.attachmentType?.startsWith("image/");
  return (
    <article className="flex gap-3 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-line-strong sm:gap-4 sm:p-5">
      <VoteControl postId={post.id} score={post.score} myVote={post.myVote} canVote={post.canParticipate || isAdmin} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
          {showClub && (
            <Link href={`/clubs/${post.clubSlug}`} className="inline-flex items-center gap-1.5 font-medium text-ink-soft hover:text-ink">
              <ClubMark name={post.clubName} slug={post.clubSlug} size="sm" />
              {post.clubName}
            </Link>
          )}
          {showClub && <span aria-hidden>·</span>}
          <span>{post.authorName}</span>
          <span aria-hidden>·</span>
          <time dateTime={post.createdAt.toISOString()}>{timeAgo(post.createdAt)}</time>
          {post.isPinned && !showClub && (
            <Badge tone="accent">
              <Pin size={11} /> Pinned
            </Badge>
          )}
        </div>
        <h2 className="mt-1.5 text-[17px] font-semibold leading-snug text-ink">
          <Link href={`/posts/${post.id}`} className="hover:text-accent">
            {post.title}
          </Link>
        </h2>
        {post.body && <p className="mt-1.5 line-clamp-3 text-[15px] leading-relaxed text-ink-soft">{post.body}</p>}
        {isImage && post.attachmentId && (
          <Link href={`/posts/${post.id}`} className="mt-3 block overflow-hidden rounded-lg border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element -- served from our own DB-backed route */}
            <img src={`/api/attachments/${post.attachmentId}`} alt={post.attachmentName ?? ""} className="max-h-80 w-full object-cover" loading="lazy" />
          </Link>
        )}
        {(post.linkUrl || (post.attachmentId && !isImage)) && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {post.linkUrl && <LinkPreview url={post.linkUrl} />}
            {post.attachmentId && !isImage && (
              <AttachmentLink id={post.attachmentId} name={post.attachmentName!} type={post.attachmentType!} size={post.attachmentSize!} />
            )}
          </div>
        )}
        <div className="-ml-2 mt-3 flex items-center gap-1">
          <Link href={`/posts/${post.id}`} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-ink-muted hover:bg-sunken hover:text-ink">
            <MessageSquare size={16} />
            {post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}
          </Link>
          <BookmarkButton postId={post.id} isBookmarked={post.isBookmarked} />
        </div>
      </div>
    </article>
  );
}
