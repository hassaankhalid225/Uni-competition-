import Link from "next/link";
import { Plus, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { listClubs } from "@/lib/queries/clubs";
import { MembershipButton } from "@/components/membership-button";
import { Badge, ButtonLink, ClubMark, EmptyState, PageHeader } from "@/components/ui";

export const metadata = { title: "Clubs" };

export default async function ClubsPage({ searchParams }: PageProps<"/clubs">) {
  const user = await requireUser();
  const [clubs, { welcome }] = await Promise.all([listClubs(user.id), searchParams]);
  const joined = clubs.filter((c) => c.isMember).length;

  return (
    <div className="mx-auto max-w-5xl">
      {welcome && (
        <p role="status" className="mb-6 rounded-xl bg-success-soft px-4 py-3 text-sm text-success">
          Welcome to Campus Connect! Join a few clubs to fill your home feed.
        </p>
      )}
      <PageHeader
        eyebrow="Communities"
        title="Clubs"
        description={`${clubs.length} clubs in the CS department · you're in ${joined}.`}
        actions={
          <ButtonLink href="/clubs/request" variant="secondary">
            <Plus size={16} /> Request a club
          </ButtonLink>
        }
      />
      {clubs.length === 0 ? (
        <EmptyState title="No clubs yet" action={<ButtonLink href="/clubs/request">Request the first club</ButtonLink>}>
          Clubs are created when an admin approves a request.
        </EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {clubs.map((club) => (
            <li key={club.id} className="flex flex-col rounded-xl border border-line bg-surface p-5 transition-colors hover:border-line-strong">
              <div className="flex items-start gap-4">
                <ClubMark name={club.name} slug={club.slug} size="lg" />
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold leading-snug">
                    <Link href={`/clubs/${club.slug}`} className="hover:text-accent">
                      {club.name}
                    </Link>
                  </h2>
                  <p className="mt-0.5 font-mono text-xs text-ink-muted">
                    {club.memberCount} {club.memberCount === 1 ? "member" : "members"} · {club.postCount} {club.postCount === 1 ? "post" : "posts"}
                  </p>
                </div>
              </div>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed text-ink-soft">{club.description}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  {club.isModerator ? (
                    <Badge tone="accent">
                      <ShieldCheck size={12} /> You moderate
                    </Badge>
                  ) : club.isMember ? (
                    <Badge tone="success">Joined</Badge>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <ButtonLink href={`/clubs/${club.slug}`} variant="ghost" size="sm">
                    Open
                  </ButtonLink>
                  <MembershipButton clubId={club.id} isMember={club.isMember} isModerator={club.isModerator} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
