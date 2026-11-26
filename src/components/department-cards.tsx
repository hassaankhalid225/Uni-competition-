import { MapPin, Clock } from "lucide-react";
import type { Announcement, DeptEvent } from "@/lib/queries/department";
import { formatDateTime, formatEventParts } from "@/lib/format";
import { AttachmentLink, LinkPreview } from "./post-card";
import { Badge, cx } from "./ui";

export function AnnouncementCard({ a, compact = false, children }: { a: Announcement; compact?: boolean; children?: React.ReactNode }) {
  return (
    <article className="relative rounded-xl border border-line bg-surface p-5 pl-6">
      <span aria-hidden className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-accent" />
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
        <Badge tone="accent">Official</Badge>
        <span className="font-medium text-ink-soft">
          {a.authorName}
          {a.authorTitle ? `, ${a.authorTitle}` : ""}
        </span>
        <time dateTime={a.createdAt.toISOString()} className="basis-full">
          Published {formatDateTime(a.createdAt)}
        </time>
      </div>
      <h2 className={cx("mt-2 font-display font-semibold leading-snug text-ink", compact ? "text-lg" : "text-xl")}>{a.title}</h2>
      <p className={cx("mt-2 whitespace-pre-line leading-relaxed text-ink-soft", compact ? "line-clamp-2 text-sm" : "text-[15px]")}>{a.body}</p>
      {!compact && (a.linkUrl || a.attachmentId) && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {a.linkUrl && <LinkPreview url={a.linkUrl} />}
          {a.attachmentId && <AttachmentLink id={a.attachmentId} name={a.attachmentName!} type={a.attachmentType!} size={a.attachmentSize!} />}
        </div>
      )}
      {children}
    </article>
  );
}

export function EventDateTile({ date, muted }: { date: Date; muted?: boolean }) {
  const p = formatEventParts(date);
  return (
    <div className={cx("flex w-14 shrink-0 flex-col items-center rounded-lg border py-1.5", muted ? "border-line bg-sunken text-ink-muted" : "border-accent/30 bg-accent-soft text-accent")}>
      <span className="text-[10px] font-semibold tracking-[0.12em]">{p.month}</span>
      <span className="font-display text-2xl font-semibold leading-none">{p.day}</span>
    </div>
  );
}

export function EventCard({ e, past = false, children }: { e: DeptEvent; past?: boolean; children?: React.ReactNode }) {
  const cancelled = e.status === "cancelled";
  const p = formatEventParts(e.startsAt);
  return (
    <article className={cx("flex gap-4 rounded-xl border border-line bg-surface p-4 sm:p-5", (past || cancelled) && "bg-surface/60")}>
      <EventDateTile date={e.startsAt} muted={past || cancelled} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={cx("text-[17px] font-semibold leading-snug", cancelled ? "text-ink-muted line-through decoration-1" : "text-ink")}>{e.title}</h3>
          {cancelled && <Badge tone="danger">Cancelled</Badge>}
          {past && !cancelled && <Badge>Past</Badge>}
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <Clock size={14} />
            {p.weekday}, {p.time}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} />
            {e.venue}
          </span>
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{e.description}</p>
        {children}
      </div>
    </article>
  );
}
