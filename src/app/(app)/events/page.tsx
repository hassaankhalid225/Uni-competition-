import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { listPastEvents, listUpcomingEvents } from "@/lib/queries/department";
import { setEventStatus } from "@/actions/department";
import { EventCard } from "@/components/department-cards";
import { SubmitButton } from "@/components/forms";
import { ButtonLink, EmptyState, PageHeader, cx } from "@/components/ui";

export const metadata = { title: "Events" };

export default async function EventsPage({ searchParams }: PageProps<"/events">) {
  const user = await requireUser();
  const isAdmin = user.role === "admin";
  const tab = (await searchParams).tab === "past" ? "past" : "upcoming";
  const events = tab === "past" ? await listPastEvents() : await listUpcomingEvents();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Department calendar"
        title="Events"
        actions={
          isAdmin && (
            <ButtonLink href="/events/new">
              <Plus size={16} /> New event
            </ButtonLink>
          )
        }
      />
      <div role="tablist" aria-label="Event period" className="mb-6 inline-flex rounded-lg border border-line bg-sunken p-0.5">
        {(["upcoming", "past"] as const).map((t) => (
          <Link
            key={t}
            role="tab"
            aria-selected={tab === t}
            href={t === "upcoming" ? "/events" : "/events?tab=past"}
            className={cx("rounded-md px-4 py-1.5 text-sm capitalize", tab === t ? "bg-surface font-medium text-ink shadow-sm ring-1 ring-line" : "text-ink-muted hover:text-ink")}
          >
            {t}
          </Link>
        ))}
      </div>

      {events.length === 0 ? (
        <EmptyState title={tab === "past" ? "No past events" : "Nothing scheduled yet"}>
          {tab === "past" ? "Completed events will be listed here." : "New departmental events will appear here as soon as they're announced."}
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((e) => (
            <EventCard key={e.id} e={e} past={tab === "past"}>
              {isAdmin && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
                  <ButtonLink href={`/events/${e.id}/edit`} variant="secondary" size="sm">
                    <Pencil size={14} /> Edit
                  </ButtonLink>
                  <form action={setEventStatus}>
                    <input type="hidden" name="id" value={e.id} />
                    <input type="hidden" name="status" value={e.status === "cancelled" ? "scheduled" : "cancelled"} />
                    <SubmitButton variant={e.status === "cancelled" ? "secondary" : "danger"} size="sm" pendingLabel="Saving…">
                      {e.status === "cancelled" ? "Restore event" : "Cancel event"}
                    </SubmitButton>
                  </form>
                </div>
              )}
            </EventCard>
          ))}
        </div>
      )}
    </div>
  );
}
