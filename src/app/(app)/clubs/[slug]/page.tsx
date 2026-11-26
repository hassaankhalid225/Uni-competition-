import { notFound } from "next/navigation";
import { PenSquare, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { getClubBySlug, listClubModerators } from "@/lib/queries/clubs";
import { listPosts } from "@/lib/queries/posts";
import { PostCard } from "@/components/post-card";
import { MembershipButton } from "@/components/membership-button";
import { SortTabs, parseSort } from "@/components/sort-tabs";
import { Avatar, Badge, ButtonLink, ClubMark, EmptyState } from "@/components/ui";

export default async function ClubPage({ params, searchParams }: PageProps<"/clubs/[slug]">) {
  const user = await requireUser();
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const club = await getClubBySlug(slug, user.id);
  if (!club) notFound();

  const sort = parseSort(sp.sort);
  const [posts, moderators] = await Promise.all([listPosts({ viewerId: user.id, clubId: club.id, sort }), listClubModerators(club.id)]);
  const isAdmin = user.role === "admin";
  const canPost = club.isMember || club.isModerator || isAdmin;
  const canModerate = club.isModerator || isAdmin;

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center">
          <ClubMark name={club.name} slug={club.slug} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">{club.name}</h1>
              {club.isModerator && (
                <Badge tone="accent">
                  <ShieldCheck size={12} /> Moderator
                </Badge>
              )}
            </div>
            <p className="mt-1 font-mono text-xs text-ink-muted">
              {club.memberCount} members · {club.postCount} posts
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canPost && (
              <ButtonLink href={`/clubs/${club.slug}/new`}>
                <PenSquare size={16} /> New post
              </ButtonLink>
            )}
            <MembershipButton clubId={club.id} isMember={club.isMember} isModerator={club.isModerator} size="md" />
          </div>
        </header>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">Discussions</h2>
          <SortTabs basePath={`/clubs/${club.slug}`} current={sort} />
        </div>

        {!canPost && (
          <p className="mb-4 rounded-xl border border-line bg-sunken px-4 py-3 text-sm text-ink-soft">
            You&apos;re browsing as a visitor. Join this club to post, comment and vote.
          </p>
        )}

        {posts.length === 0 ? (
          <EmptyState
            title="No discussions yet"
            action={canPost ? <ButtonLink href={`/clubs/${club.slug}/new`}>Write the first post</ButtonLink> : undefined}
          >
            Start the conversation: share a resource, ask a question or announce a meetup.
          </EmptyState>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} showClub={false} />
            ))}
          </div>
        )}
      </div>

      <aside className="flex flex-col gap-6 xl:sticky xl:top-10 xl:self-start">
        <section className="rounded-xl border border-line bg-surface p-5">
          <h2 className="font-semibold">About</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{club.description}</p>
        </section>
        <section className="rounded-xl border border-line bg-surface p-5">
          <h2 className="flex items-center gap-2 font-semibold">
            <ShieldCheck size={16} className="text-accent" /> Moderators
          </h2>
          {moderators.length === 0 ? (
            <p className="mt-2 text-sm text-ink-muted">No moderators assigned yet. Department admins manage this club.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {moderators.map((m) => (
                <li key={m.id} className="flex items-center gap-2 text-sm">
                  <Avatar name={m.name} size="sm" /> {m.name}
                </li>
              ))}
            </ul>
          )}
          {canModerate && (
            <p className="mt-4 border-t border-line pt-3 text-xs text-ink-muted">
              You can pin and remove posts and comments in this club.
            </p>
          )}
        </section>
      </aside>
    </div>
  );
}
