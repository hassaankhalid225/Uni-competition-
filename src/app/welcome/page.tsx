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
    body: "Topic-based clubs with threaded discussions: text posts, links, images and documents, votes, pinned posts and saved posts.",
  },
  {
    icon: Megaphone,
    title: "Official announcements",
    body: "Notices from the Head CR, Head GR and HOD with links and attachments, stamped with their publication date and time.",
  },
  {
    icon: CalendarDays,
    title: "Department calendar",
    body: "Every upcoming and past event with date, time and venue. Cancelled events stay visible and clearly marked.",
  },
  {
    icon: ShieldCheck,
    title: "Access that matches real roles",
    body: "Admins govern, moderators care for their own clubs, students participate. Every rule is enforced on the server.",
  },
];

const ROLES = [
  { role: "Students", who: "Every CS student", can: ["Explore, join and leave clubs", "Post, comment, reply, vote and save", "Request a new club and track it"] },
  { role: "Moderators", who: "Assigned per club by admins", can: ["Pin important posts in their club", "Remove posts and comments in their club only", "Keep discussions useful"] },
  { role: "Admins", who: "Head CR · Head GR · HOD", can: ["Approve or reject club requests", "Assign and remove moderators", "Publish announcements, manage events"] },
];

const eyebrow = "text-xs font-medium uppercase tracking-[0.2em] text-[#e98b62]";
const h2 = "font-display text-4xl font-semibold leading-[1.08] sm:text-5xl";

export default async function WelcomePage() {
  const [user, stats, clubs] = await Promise.all([getCurrentUser(), getLandingStats(), getLandingClubs()]);
  const primaryCta = user ? { href: "/", label: "Open Campus Connect" } : { href: "/register", label: "Create a student account" };

  return (
    <div className="relative bg-night text-snow">
      {/* One fixed 3D scene behind the whole page; it follows the scroll through each section. */}
      <HeroScene clubs={clubs.map((c) => ({ name: c.name, slug: c.slug }))} />

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <header className="absolute inset-x-0 top-0 z-30">
        <nav aria-label="Primary" className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/welcome" className="flex items-center gap-2.5">
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
          <Link href={user ? "/" : "/login"} className="rounded-lg border border-snow/25 px-4 py-2 text-sm font-medium transition-colors hover:bg-snow hover:text-night">
            {user ? "Open app" : "Sign in"}
          </Link>
        </nav>
      </header>

      <main className="relative z-10">
        {/* ── 1. Hero: connected ───────────────────────────────────────── */}
        <section data-scene="hero" className="relative flex min-h-dvh items-end md:items-center">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent md:bg-gradient-to-r md:from-night md:via-night/60 md:to-transparent" />
          <div className="relative mx-auto w-full max-w-[1240px] px-5 pb-14 pt-32 sm:px-8 md:pb-0 md:pt-0">
            <div className="max-w-xl">
              <p className={`hero-rise ${eyebrow}`}>University of Sargodha · Department of Computer Science</p>
              <h1 className="hero-rise mt-5 font-display text-[2.6rem] font-semibold leading-[1.02] sm:text-6xl lg:text-7xl" style={{ animationDelay: "80ms" }}>
                Every club, notice and event. Connected.
              </h1>
              <p className="hero-rise mt-6 max-w-lg text-lg leading-relaxed text-snow/70" style={{ animationDelay: "160ms" }}>
                Campus Connect is the CS department&apos;s own community: club discussions, official announcements from the
                Head CR, Head GR and HOD, and the event calendar, in one place.
              </p>
              <div className="hero-rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
                <Link href={primaryCta.href} className={buttonClass("primary", "md", "h-12 px-6 text-[15px]")}>
                  {primaryCta.label} <ArrowRight size={16} />
                </Link>
                {!user && (
                  <Link href="/login" className="inline-flex h-12 items-center rounded-lg border border-snow/25 px-6 text-[15px] font-medium transition-colors hover:bg-snow/10">
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
          <div className="absolute bottom-6 right-8 hidden items-center gap-5 text-xs text-snow/55 lg:flex">
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-accent" /> Department hub</span>
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#b9c6e8]" /> Clubs</span>
            <span className="flex items-center gap-2"><span className="h-1 w-5 rounded-full bg-gradient-to-r from-transparent to-accent" /> Announcements reaching every club</span>
          </div>
        </section>

        {/* ── 2. The problem: the scene scatters on the left ─────────────── */}
        <section data-scene="scattered" className="flex min-h-dvh items-center py-24">
          <div className="mx-auto grid w-full max-w-[1240px] px-5 sm:px-8 md:grid-cols-2">
            <div className="md:col-start-2">
              <Reveal>
                <p className={eyebrow}>The problem</p>
                <h2 className={`mt-4 ${h2}`}>Department life is scattered.</h2>
                <p className="mt-5 text-lg leading-relaxed text-snow/65">
                  Group chats, corridor notice boards and word of mouth. Nothing is connected, so things get missed.
                </p>
              </Reveal>
              <ol className="mt-10 flex flex-col divide-y divide-snow/10 border-y border-snow/10">
                {[
                  ["Announcements get lost", "Important notices are buried under hundreds of chat messages, or pinned where nobody looks."],
                  ["Clubs have no home", "Interest groups live in personal chats with no shared history, resources or structure."],
                  ["No official way to organise", "Starting a club, appointing moderators and running events happens informally."],
                ].map(([title, body], i) => (
                  <Reveal key={title} delay={i * 100}>
                    <li className="flex gap-6 py-6">
                      <span className="font-mono text-sm text-[#e98b62]">0{i + 1}</span>
                      <div>
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <p className="mt-1.5 leading-relaxed text-snow/60">{body}</p>
                      </div>
                    </li>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ── 3. The answer: everything reconnects ──────────────────────── */}
        <section data-scene="connected" className="flex min-h-dvh items-start pt-28 md:pt-36">
          <Reveal className="mx-auto max-w-3xl px-5 text-center sm:px-8">
            <p className={eyebrow}>The answer</p>
            <h2 className={`mt-4 ${h2} lg:text-6xl`}>Campus Connect brings it all back together.</h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-snow/65">
              One official hub for the department. Every club connected to it. Every notice reaching every student.
            </p>
          </Reveal>
        </section>

        {/* ── 4. Platform preview + features ─────────────────────────────── */}
        <section id="features" data-scene="platform" className="scroll-mt-10 py-24 lg:py-32">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
            <Reveal className="max-w-2xl">
              <p className={eyebrow}>The platform</p>
              <h2 className={`mt-4 ${h2}`}>One home screen for everything that matters today.</h2>
              <p className="mt-5 text-lg leading-relaxed text-snow/65">Official notices first, then the latest from your clubs, with upcoming events always in view.</p>
            </Reveal>
            <Reveal className="relative mt-14">
              <div className="overflow-hidden rounded-xl border border-snow/15 bg-snow shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]">
                <div className="flex items-center gap-1.5 border-b border-[#e4ddd3] px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d9d3cb]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d9d3cb]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d9d3cb]" />
                  <span className="ml-4 truncate rounded-md bg-[#efe9e1] px-3 py-1 font-mono text-xs text-[#6b6f7b]">uni-competition.vercel.app</span>
                </div>
                <Image src="/landing/app-desktop.png" alt="Campus Connect home screen: department announcements, posts from joined clubs and upcoming events" width={2880} height={1800} sizes="(min-width: 1240px) 1180px, 100vw" className="h-auto w-full" />
              </div>
              <div className="absolute -bottom-10 right-4 hidden w-[200px] overflow-hidden rounded-[28px] border-[6px] border-black bg-black shadow-2xl sm:block lg:-right-6 lg:w-[240px]">
                <Image src="/landing/app-mobile.png" alt="Campus Connect club feed on a phone" width={780} height={1688} sizes="240px" className="h-auto w-full rounded-[22px]" />
              </div>
            </Reveal>
            <div className="mt-24 grid gap-x-16 gap-y-12 md:grid-cols-2">
              {FEATURES.map(({ icon: Icon, title, body }, i) => (
                <Reveal key={title} delay={(i % 2) * 100} className="flex gap-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e98b62]/15 text-[#e98b62]">
                    <Icon size={20} />
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <p className="mt-2 leading-relaxed text-snow/60">{body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. Roles: scene on the left, content on the right ──────────── */}
        <section id="roles" data-scene="roles" className="flex min-h-dvh scroll-mt-10 items-center py-24">
          <div className="mx-auto grid w-full max-w-[1240px] px-5 sm:px-8 lg:grid-cols-[2fr_3fr]">
            <div className="lg:col-start-2">
              <Reveal>
                <p className={eyebrow}>Roles &amp; access</p>
                <h2 className={`mt-4 ${h2}`}>Built around how the department actually works.</h2>
              </Reveal>
              <div className="mt-10 divide-y divide-snow/10 border-y border-snow/10">
                {ROLES.map((r, i) => (
                  <Reveal key={r.role} delay={i * 80}>
                    <div className="py-7">
                      <div className="flex flex-wrap items-baseline gap-x-4">
                        <h3 className="font-display text-3xl font-semibold">{r.role}</h3>
                        <p className="text-sm text-snow/55">{r.who}</p>
                      </div>
                      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                        {r.can.map((c) => (
                          <li key={c} className="border-l border-[#e98b62]/50 pl-4 text-[15px] leading-relaxed text-snow/75">{c}</li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. Clubs: the constellation spreads out behind the cards ──── */}
        <section id="clubs" data-scene="clubs" className="flex min-h-dvh scroll-mt-10 items-center py-24">
          <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8">
            <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <p className={eyebrow}>Communities</p>
                <h2 className={`mt-4 ${h2}`}>Clubs already on Campus Connect.</h2>
              </div>
              <Link href={user ? "/clubs/request" : "/register"} className="inline-flex items-center gap-2 font-medium text-[#e98b62] hover:underline">
                Missing one? Request a club <ArrowRight size={16} />
              </Link>
            </Reveal>
            <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {clubs.map((c) => (
                <li key={c.slug} className="flex gap-4 rounded-xl border border-snow/10 bg-night/70 p-6 backdrop-blur-md">
                  <ClubMark name={c.name} slug={c.slug} size="md" />
                  <div className="min-w-0">
                    <h3 className="font-semibold">{c.name}</h3>
                    <p className="mt-0.5 font-mono text-xs text-snow/50">{c.members} members</p>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-snow/60">{c.description}</p>
                  </div>
                </li>
              ))}
              <li>
                <Link href={user ? "/clubs/request" : "/register"} className="flex h-full flex-col justify-center gap-1 rounded-xl border border-dashed border-[#e98b62]/40 bg-night/50 p-6 backdrop-blur-md transition-colors hover:bg-[#e98b62]/10">
                  <span className="font-semibold text-[#e98b62]">Start a new club</span>
                  <span className="text-sm text-snow/60">Suggest it in a minute. Department admins review every request.</span>
                </Link>
              </li>
            </ul>
          </div>
        </section>

        {/* ── 7. Team ───────────────────────────────────────────────────── */}
        <section id="team" data-scene="team" className="flex min-h-[80dvh] scroll-mt-10 items-center py-24">
          <div className="mx-auto grid w-full max-w-[1240px] px-5 sm:px-8 md:grid-cols-2">
            <div className="md:col-start-2">
              <Reveal>
                <p className={eyebrow}>Campus Connect Webathon</p>
                <h2 className={`mt-4 ${h2}`}>Made at the University of Sargodha.</h2>
                <p className="mt-5 max-w-md leading-relaxed text-snow/65">
                  Designed and built in four hours by students of the Department of Computer Science, with Next.js,
                  PostgreSQL and Three.js.
                </p>
              </Reveal>
              <Reveal delay={100}>
                <ul className="mt-10 grid grid-cols-2 gap-3">
                  {TEAM.map((name) => (
                    <li key={name} className="flex items-center gap-4 rounded-xl border border-snow/10 bg-night/70 p-4 backdrop-blur-md">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-snow font-display text-lg font-semibold text-night">
                        {name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                      </span>
                      <span className="font-medium">{name}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── 8. Finale ─────────────────────────────────────────────────── */}
        <section data-scene="finale" className="flex min-h-dvh flex-col justify-end">
          <Reveal className="mx-auto mb-20 max-w-3xl px-5 text-center sm:px-8">
            <h2 className={`${h2} lg:text-6xl`}>Your department, finally in one place.</h2>
            <Link href={primaryCta.href} className={buttonClass("primary", "md", "mt-9 h-12 px-7 text-[15px]")}>
              {primaryCta.label} <ArrowRight size={16} />
            </Link>
          </Reveal>
          <footer className="border-t border-snow/10 bg-night/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-3 px-5 py-8 text-sm text-snow/55 sm:flex-row sm:px-8">
              <p>Campus Connect · Department of Computer Science, University of Sargodha</p>
              <p>Team: {TEAM.join(", ")}</p>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}
