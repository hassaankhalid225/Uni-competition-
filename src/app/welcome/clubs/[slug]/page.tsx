import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Pin } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getPublicClub } from "@/lib/queries/landing";
import { timeAgo } from "@/lib/format";
import { ClubMark } from "@/components/ui";
import { ThemeToggle } from "@/components/theme-toggle";
import { StaggerReveal } from "@/components/landing/stagger-reveal";
import { SubSocietyIcon } from "@/components/sub-society-icon";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const club = await getPublicClub(slug);
  if (!club) return { title: "Club not found" };
  return { title: club.name, description: club.description };
}

const eyebrow = "font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-accent";
const label = "font-mono text-[10px] uppercase tracking-[0.14em] text-ink/55";
const pill = "inline-flex h-11 items-center gap-2.5 rounded-full px-5 text-[13px] font-medium uppercase tracking-[0.08em] transition-colors";

export default async function PublicClubPage({ params }: Props) {
  const { slug } = await params;
  const [user, club] = await Promise.all([getCurrentUser(), getPublicClub(slug)]);
  if (!club) notFound();

  const join = user ? { href: `/clubs/${club.slug}`, label: "Open this club" } : { href: "/register", label: "Join this club" };
  const facts: [string, string | number][] = [
    ["Members", club.memberCount],
    ["Discussions", club.postCount],
    ["Moderators", club.moderators.length ? club.moderators.join(", ") : "Not assigned yet"],
  ];

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header>
        <nav aria-label="Primary" className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/welcome" className="flex items-center gap-2.5">
            <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-paper">
              <span className="font-display text-lg font-bold">C</span>
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-paper" />
            </span>
            <span className="text-lg font-medium tracking-[-0.02em]">Campus Connect</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle className="text-ink/70 hover:bg-ink/10 hover:text-ink" />
            <Link href={user ? "/" : "/login"} className={`${pill} h-10 bg-ink text-paper hover:bg-accent hover:text-accent-ink`}>
              {user ? "Open app" : "Sign in"} <span className="h-1.5 w-1.5 rounded-full bg-current" />
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-[1240px] px-5 pb-24 pt-8 sm:px-8 lg:pt-14">
        <Link href="/welcome#clubs" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink/60 hover:text-ink">
          <ArrowLeft size={14} aria-hidden /> All clubs
        </Link>

        <section aria-labelledby="club-name" className="hero-rise mt-10 grid gap-10 lg:mt-16 lg:grid-cols-[3fr_2fr] lg:gap-16">
          <div>
            <div className="flex items-center gap-4">
              <ClubMark name={club.name} slug={club.slug} size="lg" />
              <p className={eyebrow}>Club · CS Department</p>
            </div>
            <h1 id="club-name" className="mt-6 text-[3rem] font-normal leading-[0.98] tracking-[-0.04em] sm:text-7xl lg:text-[6.5rem]">
              {club.name}
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink/70">{club.description}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href={join.href} className={`${pill} bg-accent text-accent-ink hover:bg-ink hover:text-paper`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" /> {join.label}
              </Link>
              {!user && (
                <Link href="/login" className={`${pill} border border-ink/20 hover:bg-ink hover:text-paper`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" /> Sign in
                </Link>
              )}
            </div>
          </div>

          <dl className="self-end divide-y divide-ink/10 border-y border-ink/10">
            {facts.map(([term, value]) => (
              <div key={term} className="flex items-baseline justify-between gap-6 py-5">
                <dt className={label}>{term}</dt>
                <dd className={typeof value === "number" ? "text-4xl font-normal tabular-nums tracking-[-0.03em]" : "text-right font-medium"}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {club.subSocieties.length > 0 && (
          <section aria-labelledby="wings" className="mt-24 lg:mt-32">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className={eyebrow}>Sub-societies</p>
                <h2 id="wings" className="mt-4 text-[2.2rem] font-normal leading-[1.02] tracking-[-0.035em] sm:text-5xl">
                  {club.subSocieties.length === 4 ? "Four wings, one club." : "The club's wings."}
                </h2>
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-ink/55">How the club splits the work. Each wing runs its own part, from recordings to contests.</p>
            </div>

            <StaggerReveal className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {club.subSocieties.map((w, i) => (
                <li key={w.id} className="flex flex-col rounded-xl border border-ink/10 bg-surface p-6">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-accent/15 text-accent">
                      <SubSocietyIcon focus={w.focus} size={20} />
                    </span>
                    <span className={label}>Wing {String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-8 text-2xl font-normal leading-tight tracking-[-0.02em]">{w.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/65">{w.description}</p>
                </li>
              ))}
            </StaggerReveal>
          </section>
        )}

        <section aria-labelledby="recent" className="mt-24 lg:mt-32">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className={eyebrow}>Inside the club</p>
              <h2 id="recent" className="mt-4 text-[2.2rem] font-normal leading-[1.02] tracking-[-0.035em] sm:text-5xl">
                Recent discussions
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-ink/55">Titles only. Sign in as a member to read and reply.</p>
          </div>

          {club.recentPosts.length === 0 ? (
            <div className="mt-10 rounded-xl border border-dashed border-ink/20 p-8">
              <p className="font-medium">No discussions yet.</p>
              <p className="mt-1 text-ink/60">Be the first to start one once you join.</p>
            </div>
          ) : (
            <StaggerReveal as="ol" className="mt-10 border-t border-ink/10">
              {club.recentPosts.map((p, i) => (
                <li key={p.id} className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1 border-b border-ink/10 py-6 sm:grid-cols-[3rem_1fr_auto] sm:items-baseline">
                  <span className="font-mono text-sm text-accent">0{i + 1}</span>
                  <div className="min-w-0">
                    <h3 className="text-xl font-normal leading-snug tracking-[-0.02em] sm:text-2xl">
                      {p.isPinned && (
                        <span className="mr-3 inline-flex translate-y-[-3px] items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 align-middle font-mono text-[10px] uppercase tracking-[0.12em] text-accent">
                          <Pin size={11} aria-hidden /> Pinned
                        </span>
                      )}
                      {p.title}
                    </h3>
                  </div>
                  <p className="col-start-2 text-sm text-ink/55 sm:col-start-3 sm:text-right">
                    {p.author} · <time dateTime={p.createdAt.toISOString()}>{timeAgo(p.createdAt)}</time>
                  </p>
                </li>
              ))}
            </StaggerReveal>
          )}

          <Link href={join.href} className="mt-10 inline-flex items-center gap-2 font-medium text-accent hover:underline">
            {user ? "Read the full feed" : "Create an account to join the conversation"} <ArrowRight size={16} aria-hidden />
          </Link>
        </section>
      </main>
    </div>
  );
}
