import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { listPosts } from "@/lib/queries/posts";
import { listAnnouncements, listUpcomingEvents } from "@/lib/queries/department";
import { listMyClubs } from "@/lib/queries/clubs";
import { formatEventParts } from "@/lib/format";
import { PostCard } from "@/components/post-card";
import { AnnouncementCard, EventDateTile } from "@/components/department-cards";
import { SortTabs, parseSort } from "@/components/sort-tabs";
import { ButtonLink, EmptyState } from "@/components/ui";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const user = await requireUser();
  const sort = parseSort((await searchParams).sort);
  const [feed, announcements, upcoming, myClubs] = await Promise.all([
    listPosts({ viewerId: user.id, onlyJoinedClubs: true, sort, limit: 30 }),
    listAnnouncements(2),
    listUpcomingEvents(4),
    listMyClubs(user.id),
  ]);
  const firstName = user.name.replace(/^Dr\.?\s+/i, "").split(" ")[0];

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0">
        <header className="mb-8">
          <p className="text-sm text-ink-muted">
            {new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", weekday: "long", day: "numeric", month: "long" }).format(new Date())}
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Good to see you, {firstName}.</h1>
        </header>

        {announcements.length > 0 && (
          <section aria-labelledby="official-heading" className="mb-10">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="official-heading" className="text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
                From the department
              </h2>
              <Link href="/announcements" className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
                All announcements <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {announcements.map((a) => (
                <Link key={a.id} href={`/announcements#${a.id}`} className="block rounded-xl transition-transform duration-150 hover:-translate-y-0.5">
                  <AnnouncementCard a={a} compact />
                </Link>
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="feed-heading">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 id="feed-heading" className="font-display text-2xl font-semibold">
              From your clubs
            </h2>
            <SortTabs basePath="/" current={sort} />
          </div>
          {myClubs.length === 0 ? (
            <EmptyState title="Your feed is quiet" action={<ButtonLink href="/clubs">Explore clubs</ButtonLink>}>
              Join a club or two and their latest discussions will show up here.
            </EmptyState>
          ) : feed.length === 0 ? (
            <EmptyState title="No posts yet" action={<ButtonLink href={`/clubs/${myClubs[0].slug}`}>Start a discussion</ButtonLink>}>
              Your clubs haven&apos;t posted anything yet. Be the first.
            </EmptyState>
          ) : (
            <div className="flex flex-col gap-3">
              {feed.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>
      </div>

      <aside className="flex flex-col gap-6 xl:sticky xl:top-10 xl:self-start">
        <section aria-labelledby="upcoming-heading" className="rounded-xl border border-line bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="upcoming-heading" className="flex items-center gap-2 font-semibold">
              <CalendarDays size={18} className="text-accent" /> Coming up
            </h2>
            <Link href="/events" className="text-sm text-accent hover:underline">
              Calendar
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-ink-muted">No upcoming events scheduled.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {upcoming.map((e) => (
                <li key={e.id} className="flex gap-3">
                  <EventDateTile date={e.startsAt} muted={e.status === "cancelled"} />
                  <div className="min-w-0">
                    <p className={e.status === "cancelled" ? "text-sm font-medium text-ink-muted line-through" : "text-sm font-medium"}>{e.title}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {e.status === "cancelled" ? "Cancelled" : `${formatEventParts(e.startsAt).time} · ${e.venue}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-line bg-surface p-5">
          <h2 className="font-semibold">Missing a community?</h2>
          <p className="mt-1 text-sm text-ink-muted">Suggest a new club. Admins review every request.</p>
          <ButtonLink href="/clubs/request" variant="secondary" size="sm" className="mt-4">
            Request a club
          </ButtonLink>
        </section>
      </aside>
    </div>
  );
}
