import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Megaphone, MessagesSquare, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getLandingClubs, getLandingStats } from "@/lib/queries/landing";
import { HeroScene } from "@/components/landing/hero-scene";
import { Reveal } from "@/components/landing/reveal";
import { ClubMark, buttonClass } from "@/components/ui";

export const metadata = {
  title: "Campus Connect: CS Department, University of Sargodha",
  description: "Clubs, discussions, official announcements and the event calendar for the Department of Computer Science, University of Sargodha.",
};

const TEAM = ["Hassaan Khalid", "Usman Shoukat", "Yumna Aziz", "Hamna"];

const FEATURES = [
  {
    icon: MessagesSquare,
    title: "Clubs with their own feeds",
    body: "Join topic-based clubs and discuss in threaded conversations: text posts, links, images and documents, votes, pinned posts and saved posts.",
  },
  {
    icon: Megaphone,
    title: "Official announcements",
    body: "Notices from the Head CR, Head GR and HOD, with links and attachments, stamped with their publication date and time. Always on top of your home feed.",
  },
  {
    icon: CalendarDays,
    title: "Department calendar",
    body: "Every upcoming and past departmental event with date, time and venue. Cancelled events stay visible and clearly marked, so nobody shows up to an empty hall.",
  },
  {
    icon: ShieldCheck,
    title: "Access that matches real roles",
    body: "Admins govern the platform, moderators care for their own clubs, and students participate. Every rule is enforced on the server, not just hidden in the UI.",
  },
];

const ROLES = [
  {
    role: "Students",
    who: "Every CS student",
    can: ["Explore, join and leave clubs", "Post, comment, reply, vote and save", "Request a new club and track its status"],
  },
  {
    role: "Moderators",
    who: "Assigned per club by admins",
    can: ["Pin important posts in their club", "Remove posts and comments in their club only", "Keep discussions useful and on-topic"],
  },
  {
    role: "Admins",
    who: "Head CR · Head GR · HOD",
    can: ["Approve or reject club requests", "Assign and remove club moderators", "Publish announcements and manage events"],
  },
];

export default async function WelcomePage() {
  const [user, stats, clubs] = await Promise.all([getCurrentUser(), getLandingStats(), getLandingClubs()]);
  const primaryCta = user ? { href: "/", label: "Open Campus Connect" } : { href: "/register", label: "Create a student account" };

  return (
    <div className="bg-paper text-ink">
      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <header className="absolute inset-x-0 top-0 z-30">
        <nav aria-label="Primary" className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/welcome" className="flex items-center gap-2.5 text-snow">
            <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg bg-snow text-night">
              <span className="font-display text-lg font-bold">C</span>
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-night" />
            </span>
            <span className="font-display text-xl font-semibold">Campus Connect</span>
          </Link>
          <div className="hidden items-center gap-8 text-sm text-snow/70 md:flex">
            <a href="#features" className="hover:text-snow">Features</a>
            <a href="#roles" className="hover:text-snow">Roles</a>
            <a href="#clubs" className="hover:text-snow">Clubs</a>
            <a href="#team" className="hover:text-snow">Team</a>
          </div>
          <Link
            href={user ? "/" : "/login"}
            className="rounded-lg border border-snow/25 px-4 py-2 text-sm font-medium text-snow transition-colors hover:bg-snow hover:text-night"
          >
            {user ? "Open app" : "Sign in"}
          </Link>
        </nav>
      </header>

      {/* ── Hero with the 3D department constellation ─────────────────── */}
      <section className="dark-hero relative isolate flex min-h-dvh items-end overflow-hidden bg-night text-snow md:items-center">
        <HeroScene clubs={clubs.map((c) => ({ name: c.name, slug: c.slug }))} />
        {/* Keeps the headline legible over the scene */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent md:bg-gradient-to-r md:from-night md:via-night/70 md:to-transparent" />

        <div className="relative z-20 mx-auto w-full max-w-[1240px] px-5 pb-14 pt-32 sm:px-8 md:pb-0 md:pt-0">
          <div className="max-w-xl">
            <p className="hero-rise text-xs font-medium uppercase tracking-[0.2em] text-[#e98b62]">
              University of Sargodha · Department of Computer Science
            </p>
            <h1 className="hero-rise mt-5 font-display text-[2.6rem] font-semibold leading-[1.02] sm:text-6xl lg:text-7xl" style={{ animationDelay: "80ms" }}>
              Every club, notice and event. Connected.
            </h1>
            <p className="hero-rise mt-6 max-w-lg text-lg leading-relaxed text-snow/70" style={{ animationDelay: "160ms" }}>
              Campus Connect is the CS department&apos;s own community: club discussions, official announcements
              from the Head CR, Head GR and HOD, and the event calendar, in one place.
            </p>
            <div className="hero-rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
              <Link href={primaryCta.href} className={buttonClass("primary", "md", "h-12 px-6 text-[15px]")}>
                {primaryCta.label} <ArrowRight size={16} />
              </Link>
              {!user && (
                <Link href="/login" className="inline-flex h-12 items-center rounded-lg border border-snow/25 px-6 text-[15px] font-medium text-snow transition-colors hover:bg-snow/10">
                  I already have an account
                </Link>
              )}
            </div>

            <dl className="hero-rise mt-14 grid max-w-lg grid-cols-4 gap-4 border-t border-snow/15 pt-6" style={{ animationDelay: "320ms" }}>
              {[
                [stats.clubs, "clubs"],
                [stats.students, "students"],
                [stats.discussions, "discussions"],
                [stats.upcomingEvents, "upcoming events"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-display text-3xl font-semibold tabular-nums">{value}</dd>
                  <dd className="mt-0.5 text-xs text-snow/55">{label}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[11px] text-snow/40">Live counts from the platform.</p>
          </div>
        </div>

        {/* Explains what the 3D scene shows */}
        <div className="absolute bottom-6 right-8 z-10 hidden items-center gap-5 text-xs text-snow/55 lg:flex">
          <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-accent" /> Department hub</span>
          <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#b9c6e8]" /> Clubs</span>
          <span className="flex items-center gap-2"><span className="h-1 w-5 rounded-full bg-gradient-to-r from-transparent to-accent" /> Announcements reaching every club</span>
        </div>
      </section>

      {/* ── The problem ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1240px] px-5 py-24 sm:px-8 lg:py-32">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-24">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Why we built it</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.1] sm:text-5xl">
              Department life is scattered across group chats, notice boards and word of mouth.
            </h2>
          </Reveal>
          <ol className="flex flex-col divide-y divide-line border-y border-line">
            {[
              ["Announcements get lost", "Important notices are buried under hundreds of chat messages, or pinned to a board nobody passes."],
              ["Clubs have no home", "Interest groups live in personal chats with no shared history, resources or structure."],
              ["No official way to organise", "Starting a club, appointing moderators and running events happens informally, if at all."],
            ].map(([title, body], i) => (
              <Reveal key={title} delay={i * 100}>
                <li className="flex gap-6 py-7">
                  <span className="font-mono text-sm text-accent">0{i + 1}</span>
                  <div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="mt-1.5 leading-relaxed text-ink-muted">{body}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Product preview + features ────────────────────────────────── */}
      <section id="features" className="scroll-mt-10 border-y border-line bg-sunken">
        <div className="mx-auto max-w-[1240px] px-5 py-24 sm:px-8 lg:py-32">
          <Reveal className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">The platform</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.1] sm:text-5xl">One home screen for everything that matters today.</h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-muted">
              Official notices first, then the latest from your clubs, with upcoming events always in view.
            </p>
          </Reveal>

          <Reveal className="relative mt-14 lg:mt-16">
            <div className="overflow-hidden rounded-xl border border-line-strong bg-surface shadow-[0_30px_80px_-30px_rgba(20,20,30,0.35)]">
              <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
                <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
                <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
                <span className="ml-4 truncate rounded-md bg-sunken px-3 py-1 font-mono text-xs text-ink-muted">uni-competition.vercel.app</span>
              </div>
              <Image src="/landing/app-desktop.png" alt="Campus Connect home screen: department announcements, posts from joined clubs and upcoming events" width={2880} height={1800} sizes="(min-width: 1240px) 1180px, 100vw" className="h-auto w-full" priority={false} />
            </div>
            <div className="absolute -bottom-10 right-4 hidden w-[200px] overflow-hidden rounded-[28px] border-[6px] border-ink bg-ink shadow-2xl sm:block lg:-right-6 lg:w-[240px]">
              <Image src="/landing/app-mobile.png" alt="Campus Connect club feed on a phone" width={780} height={1688} sizes="240px" className="h-auto w-full rounded-[22px]" />
            </div>
          </Reveal>

          <div className="mt-24 grid gap-x-16 gap-y-12 md:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={(i % 2) * 100} className="flex gap-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Icon size={20} />
                </span>
                <div>
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-muted">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ─────────────────────────────────────────────────────── */}
      <section id="roles" className="scroll-mt-10 bg-night text-snow">
        <div className="mx-auto max-w-[1240px] px-5 py-24 sm:px-8 lg:py-32">
          <Reveal className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#e98b62]">Roles &amp; access</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.1] sm:text-5xl">Built around how the department actually works.</h2>
          </Reveal>
          <div className="mt-14 divide-y divide-snow/10 border-y border-snow/10">
            {ROLES.map((r, i) => (
              <Reveal key={r.role} delay={i * 80}>
                <div className="grid gap-4 py-9 md:grid-cols-[1fr_2fr] md:gap-10">
                  <div>
                    <h3 className="font-display text-3xl font-semibold">{r.role}</h3>
                    <p className="mt-1 text-sm text-snow/55">{r.who}</p>
                  </div>
                  <ul className="grid gap-3 sm:grid-cols-3">
                    {r.can.map((c) => (
                      <li key={c} className="border-l border-[#e98b62]/50 pl-4 leading-relaxed text-snow/75">
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Clubs (live) ──────────────────────────────────────────────── */}
      <section id="clubs" className="scroll-mt-10 mx-auto max-w-[1240px] px-5 py-24 sm:px-8 lg:py-32">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Communities</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.1] sm:text-5xl">Clubs already on Campus Connect.</h2>
          </div>
          <Link href={user ? "/clubs/request" : "/register"} className="inline-flex items-center gap-2 font-medium text-accent hover:underline">
            Missing one? Request a club <ArrowRight size={16} />
          </Link>
        </Reveal>
        <ul className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {clubs.map((c) => (
            <li key={c.slug} className="flex gap-4 bg-surface p-6">
              <ClubMark name={c.name} slug={c.slug} size="md" />
              <div className="min-w-0">
                <h3 className="font-semibold">{c.name}</h3>
                <p className="mt-0.5 font-mono text-xs text-ink-muted">{c.members} members</p>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-muted">{c.description}</p>
              </div>
            </li>
          ))}
          {/* The "start a club" tile fills whatever is left of the last row. */}
          <li className={`flex bg-surface ${clubs.length % 2 === 0 ? "sm:col-span-2" : ""} ${["lg:col-span-3", "lg:col-span-2", "lg:col-span-1"][clubs.length % 3]}`}>
            <Link href={user ? "/clubs/request" : "/register"} className="group flex w-full flex-col justify-center gap-1 p-6 transition-colors hover:bg-accent-soft">
              <span className="font-semibold text-accent">Start a new club</span>
              <span className="text-sm text-ink-muted">Suggest it in a minute. Department admins review every request.</span>
            </Link>
          </li>
        </ul>
      </section>

      {/* ── Team & credits ────────────────────────────────────────────── */}
      <section id="team" className="scroll-mt-10 border-t border-line">
        <div className="mx-auto grid max-w-[1240px] gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:py-28">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Campus Connect Webathon</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.1]">Made at the University of Sargodha.</h2>
            <p className="mt-5 max-w-md leading-relaxed text-ink-muted">
              Designed and built in four hours by students of the Department of Computer Science, with Next.js,
              PostgreSQL and Three.js.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <ul className="grid grid-cols-2 gap-4">
              {TEAM.map((name) => (
                <li key={name} className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-night font-display text-lg font-semibold text-snow">
                    {name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </span>
                  <span className="font-medium">{name}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────── */}
      <section className="bg-accent text-accent-ink">
        <div className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-8 px-5 py-16 sm:px-8 md:flex-row md:items-center">
          <h2 className="max-w-xl font-display text-3xl font-semibold leading-tight sm:text-4xl">Your department, finally in one place.</h2>
          <Link href={primaryCta.href} className="inline-flex h-12 items-center gap-2 rounded-lg bg-night px-6 text-[15px] font-medium text-snow transition-transform hover:-translate-y-0.5">
            {primaryCta.label} <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="bg-night text-snow/55">
        <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-3 px-5 py-8 text-sm sm:flex-row sm:px-8">
          <p>Campus Connect · Department of Computer Science, University of Sargodha</p>
          <p>Team: {TEAM.join(", ")}</p>
        </div>
      </footer>
    </div>
  );
}
