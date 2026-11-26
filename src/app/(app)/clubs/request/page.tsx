import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user";
import { listMyClubRequests } from "@/lib/queries/clubs";
import { timeAgo } from "@/lib/format";
import { Badge, PageHeader } from "@/components/ui";
import { RequestClubForm } from "./request-form";

export const metadata = { title: "Request a club" };

const STATUS_TONE = { pending: "warning", approved: "success", rejected: "danger" } as const;

export default async function RequestClubPage() {
  const user = await requireUser();
  const requests = await listMyClubRequests(user.id);

  return (
    <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div>
        <PageHeader eyebrow="Clubs" title="Request a new club" description="Department admins (Head CR, Head GR, HOD) review every request." />
        <div className="rounded-xl border border-line bg-surface p-5 sm:p-6">
          <RequestClubForm />
        </div>
      </div>
      <aside className="lg:pt-24">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">Your requests</h2>
        {requests.length === 0 ? (
          <p className="text-sm text-ink-muted">You haven&apos;t requested any clubs yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {requests.map((r) => (
              <li key={r.id} className="rounded-xl border border-line bg-surface p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{r.name}</p>
                  <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-ink-muted">Requested {timeAgo(r.createdAt)}</p>
                {r.reviewNote && <p className="mt-2 text-sm text-ink-soft">“{r.reviewNote}”</p>}
                {r.clubSlug && (
                  <Link href={`/clubs/${r.clubSlug}`} className="mt-2 inline-block text-sm text-accent hover:underline">
                    Open club →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
