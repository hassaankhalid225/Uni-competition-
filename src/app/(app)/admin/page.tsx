import Link from "next/link";
import { X } from "lucide-react";
import { requireAdmin } from "@/lib/auth/current-user";
import { listClubRequests, listClubsWithModerators, listStudents } from "@/lib/queries/admin";
import { removeModerator } from "@/actions/admin";
import { timeAgo } from "@/lib/format";
import { Avatar, Badge, ClubMark, EmptyState, PageHeader } from "@/components/ui";
import { AssignModeratorForm, ReviewRequestForm } from "./admin-forms";

export const metadata = { title: "Admin console" };

const STATUS_TONE = { pending: "warning", approved: "success", rejected: "danger" } as const;

export default async function AdminPage() {
  const admin = await requireAdmin();
  const [requests, clubs, students] = await Promise.all([listClubRequests(), listClubsWithModerators(), listStudents()]);
  const pending = requests.filter((r) => r.status === "pending");
  const reviewed = requests.filter((r) => r.status !== "pending").slice(0, 8);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow={`${admin.adminTitle ?? "Admin"} · platform access`}
        title="Admin console"
        description="Head CR, Head GR and HOD share this console. Review club requests and assign moderators."
      />

      <section aria-labelledby="requests-heading" className="mb-12">
        <div className="mb-4 flex items-center gap-3">
          <h2 id="requests-heading" className="font-display text-2xl font-semibold">
            Club requests
          </h2>
          {pending.length > 0 && <Badge tone="warning">{pending.length} pending</Badge>}
        </div>
        {pending.length === 0 ? (
          <EmptyState title="You're all caught up">New club requests from students will appear here.</EmptyState>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {pending.map((r) => (
              <li key={r.id} className="rounded-xl border border-line bg-surface p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold">{r.name}</h3>
                  <Badge tone="warning">pending</Badge>
                </div>
                <p className="mt-1 text-xs text-ink-muted">
                  {r.requesterName} · {r.requesterEmail} · {timeAgo(r.createdAt)}
                </p>
                <p className="mt-3 text-[15px] text-ink-soft">{r.description}</p>
                <p className="mt-3 rounded-lg bg-sunken px-3 py-2 text-sm text-ink-soft">
                  <span className="font-medium text-ink">Why: </span>
                  {r.reason}
                </p>
                <ReviewRequestForm requestId={r.id} />
              </li>
            ))}
          </ul>
        )}
        {reviewed.length > 0 && (
          <details className="mt-6 rounded-xl border border-line bg-surface">
            <summary className="cursor-pointer px-5 py-3 text-sm font-medium">Recently reviewed ({reviewed.length})</summary>
            <ul className="divide-y divide-line border-t border-line">
              {reviewed.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                  <span>
                    <span className="font-medium">{r.name}</span> <span className="text-ink-muted">by {r.requesterName}</span>
                  </span>
                  <span className="flex items-center gap-2 text-xs text-ink-muted">
                    {r.reviewerName && `${r.reviewerName} · `}
                    {r.reviewedAt && timeAgo(r.reviewedAt)}
                    <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
                  </span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>

      <section aria-labelledby="mods-heading">
        <h2 id="mods-heading" className="mb-1 font-display text-2xl font-semibold">
          Moderators
        </h2>
        <p className="mb-4 text-sm text-ink-muted">Moderators can pin and remove content only in the clubs they&apos;re assigned to.</p>
        <div className="mb-6 rounded-xl border border-line bg-surface p-5">
          <AssignModeratorForm clubs={clubs.map((c) => ({ id: c.id, name: c.name }))} students={students} />
        </div>
        <ul className="grid gap-3 md:grid-cols-2">
          {clubs.map((club) => (
            <li key={club.id} className="rounded-xl border border-line bg-surface p-4">
              <Link href={`/clubs/${club.slug}`} className="flex items-center gap-3 font-medium hover:text-accent">
                <ClubMark name={club.name} slug={club.slug} size="sm" /> {club.name}
              </Link>
              {club.moderators.length === 0 ? (
                <p className="mt-3 text-sm text-ink-muted">No moderators yet.</p>
              ) : (
                <ul className="mt-3 flex flex-col gap-2">
                  {club.moderators.map((m) => (
                    <li key={m.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-2">
                        <Avatar name={m.name} size="sm" /> {m.name}
                      </span>
                      <form action={removeModerator}>
                        <input type="hidden" name="clubId" value={club.id} />
                        <input type="hidden" name="userId" value={m.id} />
                        <button type="submit" aria-label={`Remove ${m.name} as moderator of ${club.name}`} className="rounded-md p-1 text-ink-muted hover:bg-danger-soft hover:text-danger">
                          <X size={16} />
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
