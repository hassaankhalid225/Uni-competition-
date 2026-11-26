import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Megaphone, MessagesSquare, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getLandingClubs, getLandingStats } from "@/lib/queries/landing";
import { HeroScene, PhysicsStage } from "@/components/landing/hero-scene";
import { WingsDeck } from "@/components/landing/wings-deck";
import { IntroLoader, MarkerRow, RevealLines, ScatterWord, ScrollArc, SmoothScroll } from "@/components/landing/landing-motion";
import { Reveal } from "@/components/landing/reveal";
import { StaggerReveal } from "@/components/landing/stagger-reveal";
import { ClubMark } from "@/components/ui";
import { SUB_SOCIETY_SHORT_LABEL } from "@/components/sub-society-icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark } from "@/components/brand-mark";

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

const eyebrow = "font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-accent";
const h2 = "text-[2.6rem] font-normal leading-[1.02] tracking-[-0.035em] sm:text-6xl lg:text-7xl";
const pill = "inline-flex h-11 items-center gap-2.5 rounded-full px-5 text-[13px] font-medium uppercase tracking-[0.08em] transition-colors";

export default async function WelcomePage() {
  const [user, stats, clubs] = await Promise.all([getCurrentUser(), getLandingStats(), getLandingClubs()]);
  const primaryCta = user ? { href: "/", label: "Open Campus Connect" } : { href: "/register", label: "Create a student account" };

  return (
    <div className="relative bg-paper text-ink">
      {/* One fixed 3D scene behind the whole page; it follows the scroll through each section. */}
      <IntroLoader />
      <SmoothScroll />
      <HeroScene clubs={clubs.map((c) => ({ name: c.name, slug: c.slug }))} />

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <header className="absolute inset-x-0 top-0 z-30">
        <nav aria-label="Primary" className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/welcome" className="flex items-center gap-2.5">
            <BrandMark size={36} />
            <span className="text-lg font-medium tracking-[-0.02em]">Campus Connect</span>
          </Link>
          <div className="hidden items-center gap-8 text-sm text-ink/70 md:flex">
            <a href="#features" className="hover:text-ink">Features</a>
            <a href="#roles" className="hover:text-ink">Roles</a>
            <a href="#clubs" className="hover:text-ink">Clubs</a>
            <a href="#team" className="hover:text-ink">Team</a>
          </div>
          <div className="flex items-center gap-2">
          <ThemeToggle className="text-ink/70 hover:bg-ink/10 hover:text-ink" />
          <Link href={user ? "/" : "/login"} className={`${pill} h-10 bg-ink text-paper hover:bg-accent hover:text-accent-ink`}>
            {user ? "Open app" : "Sign in"} <span className="h-1.5 w-1.5 rounded-full bg-current" />
          </Link>
          </div>
        </nav>
      </header>

      <main className="relative z-10">
        {/* ── 1. Hero: interactive 3D stage + headline ─────────────────── */}
        <section data-scene="hero" className="relative">
          <div className="px-3 pt-20 sm:px-5 sm:pt-24">
            <div className="relative h-[64dvh] overflow-hidden rounded-[28px] bg-night sm:h-[74dvh] dark:bg-[#22252c]">
              {/* Server-rendered still of the pile: visible before any JS loads, hidden once the live scene is ready. */}
              <picture className="stage-poster pointer-events-none absolute inset-0 transition-opacity duration-700">
                <source media="(max-width: 767px)" srcSet="/landing/stage-poster-mobile.webp" />
                <img src="/landing/stage-poster-desktop.webp" alt="" fetchPriority="high" className="h-full w-full object-cover" />
              </picture>
              <PhysicsStage />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-5 font-mono text-[11px] uppercase tracking-[0.18em] text-snow/70 sm:p-7">
                <span>University of Sargodha<br />Department of Computer Science</span>
                <span className="hidden text-right sm:block">Move your cursor<br />through the pile</span>
              </div>
            </div>
            <div className="px-2 pt-4 sm:px-3">
              <MarkerRow label="Scroll to explore" />
            </div>
          </div>
        </section>

        <section data-scene="intro" className="relative overflow-hidden">
          {/* Ribbon spans the whole section, behind the text */}
          <ScrollArc className="absolute inset-0 h-full w-full text-accent opacity-90" />
          <div className="relative mx-auto max-w-[1240px] px-5 pb-28 pt-24 sm:px-8 lg:pt-32">
            <RevealLines
              as="h1"
              lines={["Every club,", "notice and event.", <>Get <span key="c" className="fx-underline">connected.</span></>]}
              className="relative text-[3.2rem] font-normal leading-[0.98] tracking-[-0.045em] sm:text-7xl lg:ml-[16%] lg:text-[8.5rem]"
            />
            <div className="relative mt-14 grid gap-10 lg:ml-[46%]">
              <Reveal>
                <p className="max-w-md text-lg leading-relaxed text-ink/70">
                  Campus Connect is the CS department&apos;s own community: club discussions, official announcements from the
                  Head CR, Head GR and HOD, and the event calendar, in one place.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={primaryCta.href} className={`${pill} bg-accent text-accent-ink hover:bg-ink hover:text-paper`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" /> {primaryCta.label}
                  </Link>
                  {!user && (
                    <Link href="/login" className={`${pill} border border-ink/20 hover:bg-ink hover:text-paper`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" /> Sign in
                    </Link>
                  )}
                </div>
              </Reveal>
              <Reveal delay={120}>
                <dl className="grid max-w-md grid-cols-4 gap-4 border-t border-ink/15 pt-6">
                  {[
                    [stats.clubs, "clubs"],
                    [stats.students, "students"],
                    [stats.discussions, "discussions"],
                    [stats.upcomingEvents, "upcoming events"],
                  ].map(([value, label]) => (
                    <div key={label}>
                      <dt className="sr-only">{label}</dt>
                      <dd className="text-3xl font-normal tracking-[-0.03em] tabular-nums">{value}</dd>
                      <dd className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink/55">{label}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ink/40">Live counts from the platform</p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── 2. The problem: the scene scatters on the left ─────────────── */}
        <section data-scene="scattered" className="flex min-h-dvh items-center py-24">
          <div className="mx-auto grid w-full max-w-[1240px] px-5 sm:px-8 md:grid-cols-2">
            <div className="md:col-start-2">
              <Reveal>
                <p className={eyebrow}>The problem</p>
                <RevealLines lines={["Department life", <>is <ScatterWord key="s" text="scattered." /></>]} className={`mt-4 ${h2}`} />
                <p className="mt-5 text-lg leading-relaxed text-ink/65">
                  Group chats, corridor notice boards and word of mouth. Nothing is connected, so things get missed.
                </p>
              </Reveal>
              <ol className="mt-10 flex flex-col divide-y divide-ink/10 border-y border-ink/10">
                {[
                  ["Announcements get lost", "Important notices are buried under hundreds of chat messages, or pinned where nobody looks."],
                  ["Clubs have no home", "Interest groups live in personal chats with no shared history, resources or structure."],
                  ["No official way to organise", "Starting a club, appointing moderators and running events happens informally."],
                ].map(([title, body], i) => (
                  <Reveal key={title} delay={i * 100}>
                    <li className="flex gap-6 py-6">
                      <span className="font-mono text-sm text-accent">0{i + 1}</span>
                      <div>
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <p className="mt-1.5 leading-relaxed text-ink/60">{body}</p>
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
            <RevealLines lines={["Campus Connect brings", "it all back together."]} className={`mt-4 ${h2}`} />
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink/65">
              One official hub for the department. Every club connected to it. Every notice reaching every student.
            </p>
          </Reveal>
        </section>

        {/* ── 4. Platform preview + features ─────────────────────────────── */}
        <section id="features" data-scene="platform" className="scroll-mt-10 py-24 lg:py-32">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
            <Reveal className="max-w-2xl">
              <p className={eyebrow}>The platform</p>
              <RevealLines lines={[<>One <span key="h" className="fx-highlight">home screen</span> for</>, "everything that", "matters today."]} className={`mt-4 ${h2}`} />
              <p className="mt-5 text-lg leading-relaxed text-ink/65">Official notices first, then the latest from your clubs, with upcoming events always in view.</p>
            </Reveal>
            <Reveal className="relative mt-14">
              <div className="overflow-hidden rounded-xl border border-ink/15 bg-[#f8f5f0] shadow-[0_40px_100px_-40px_rgba(20,20,30,0.45)] dark:bg-[#1f2229] dark:shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]">
                <div className="flex items-center gap-1.5 border-b border-[#e4ddd3] px-4 py-3 dark:border-white/10">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d9d3cb] dark:bg-white/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d9d3cb] dark:bg-white/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d9d3cb] dark:bg-white/20" />
                  <span className="ml-4 truncate rounded-md bg-[#efe9e1] px-3 py-1 font-mono text-xs text-[#6b6f7b] dark:bg-white/10 dark:text-white/60">uni-competition.vercel.app</span>
                </div>
                <Image src="/landing/app-desktop.png" alt="Campus Connect home screen: department announcements, posts from joined clubs and upcoming events" width={2880} height={1800} sizes="(min-width: 1240px) 1180px, 100vw" className="h-auto w-full dark:hidden" />
                <Image src="/landing/app-desktop-dark.png" alt="Campus Connect home screen in dark mode" width={2880} height={1800} sizes="(min-width: 1240px) 1180px, 100vw" className="hidden h-auto w-full dark:block" />
              </div>
              <div className="absolute -bottom-10 right-4 hidden w-[200px] overflow-hidden rounded-[28px] border-[6px] border-black bg-black shadow-2xl sm:block lg:-right-6 lg:w-[240px]">
                <Image src="/landing/app-mobile.png" alt="Campus Connect club feed on a phone" width={780} height={1688} sizes="240px" className="h-auto w-full rounded-[22px] dark:hidden" />
                <Image src="/landing/app-mobile-dark.png" alt="Campus Connect club feed on a phone in dark mode" width={780} height={1688} sizes="240px" className="hidden h-auto w-full rounded-[22px] dark:block" />
              </div>
            </Reveal>
            <StaggerReveal className="mt-24 grid gap-x-16 gap-y-12 md:grid-cols-2">
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
                    <Icon size={20} />
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <p className="mt-2 leading-relaxed text-ink/60">{body}</p>
                  </div>
                </li>
              ))}
            </StaggerReveal>
          </div>
        </section>

        {/* ── 4b. Four wings: scroll-dealt card deck ───────────────────── */}
        <WingsDeck />

        {/* ── 5. Roles: scene on the left, content on the right ──────────── */}
        <section id="roles" data-scene="roles" className="flex min-h-dvh scroll-mt-10 items-center py-24">
          <div className="mx-auto grid w-full max-w-[1240px] px-5 sm:px-8 lg:grid-cols-[2fr_3fr]">
            <div className="lg:col-start-2">
              <Reveal>
                <p className={eyebrow}>Roles &amp; access</p>
                <RevealLines lines={["Built around how", "the department", "actually works."]} className={`mt-4 ${h2}`} />
              </Reveal>
              <div className="mt-10 divide-y divide-ink/10 border-y border-ink/10">
                {ROLES.map((r, i) => (
                  <Reveal key={r.role} delay={i * 80}>
                    <div className="py-7">
                      <div className="flex flex-wrap items-baseline gap-x-4">
                        <h3 className="text-3xl font-normal tracking-[-0.03em]">{r.role}</h3>
                        <p className="text-sm text-ink/55">{r.who}</p>
                      </div>
                      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                        {r.can.map((c) => (
                          <li key={c} className="border-l border-accent/50 pl-4 text-[15px] leading-relaxed text-ink/75">{c}</li>
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
                <RevealLines lines={["Clubs already on", "Campus Connect."]} className={`mt-4 ${h2}`} />
              </div>
              <Link href={user ? "/clubs/request" : "/register"} className="inline-flex items-center gap-2 font-medium text-accent hover:underline">
                Missing one? Request a club <ArrowRight size={16} />
              </Link>
            </Reveal>
            <StaggerReveal className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {clubs.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/welcome/clubs/${c.slug}`}
                    className="group relative flex h-full gap-4 rounded-xl border border-ink/10 bg-paper/70 p-6 backdrop-blur-md transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_18px_40px_-24px_rgba(20,20,30,0.35)] focus-visible:-translate-y-1 focus-visible:border-accent/60 motion-reduce:hover:translate-y-0"
                  >
                    <ClubMark name={c.name} slug={c.slug} size="md" />
                    <div className="min-w-0 pr-6">
                      <h3 className="font-semibold">{c.name}</h3>
                      <p className="mt-0.5 font-mono text-xs text-ink/50">{c.members} members</p>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/60">{c.description}</p>
                      {c.wings.length > 0 && (
                        <p className="mt-3 flex flex-wrap items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-ink/60">
                          <span className="mr-1 text-accent">{c.wings.length} wings</span>
                          {c.wings.map((f) => (
                            <span key={f} className="rounded-full border border-ink/10 px-2 py-0.5">
                              {SUB_SOCIETY_SHORT_LABEL[f]}
                            </span>
                          ))}
                        </p>
                      )}
                    </div>
                    <ArrowRight
                      size={18}
                      aria-hidden
                      className="absolute right-5 top-6 -translate-x-2 text-accent opacity-0 transition-[transform,opacity] duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                    />
                  </Link>
                </li>
              ))}
              <li>
                <Link href={user ? "/clubs/request" : "/register"} className="flex h-full flex-col justify-center gap-1 rounded-xl border border-dashed border-accent/40 bg-paper/50 p-6 backdrop-blur-md transition-colors hover:bg-accent/10">
                  <span className="font-semibold text-accent">Start a new club</span>
                  <span className="text-sm text-ink/60">Suggest it in a minute. Department admins review every request.</span>
                </Link>
              </li>
            </StaggerReveal>
          </div>
        </section>

        {/* ── 7. Team ───────────────────────────────────────────────────── */}
        <section id="team" data-scene="team" className="flex min-h-[80dvh] scroll-mt-10 items-center py-24">
          <div className="mx-auto grid w-full max-w-[1240px] px-5 sm:px-8 md:grid-cols-2">
            <div className="md:col-start-2">
              <Reveal>
                <p className={eyebrow}>Campus Connect Webathon</p>
                <RevealLines lines={["Made at the", "University of", "Sargodha."]} className={`mt-4 ${h2}`} />
                <p className="mt-5 max-w-md leading-relaxed text-ink/65">
                  Designed and built in four hours by students of the Department of Computer Science, with Next.js,
                  PostgreSQL and Three.js.
                </p>
              </Reveal>
              <StaggerReveal className="mt-10 grid grid-cols-2 gap-3">
                  {TEAM.map((name) => (
                    <li key={name} className="flex items-center gap-4 rounded-xl border border-ink/10 bg-paper/70 p-4 backdrop-blur-md">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink text-base font-medium text-paper">
                        {name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                      </span>
                      <span className="font-medium">{name}</span>
                    </li>
                  ))}
              </StaggerReveal>
            </div>
          </div>
        </section>

        {/* ── 8. Finale ─────────────────────────────────────────────────── */}
        <section data-scene="finale" className="flex min-h-dvh flex-col justify-end">
          <Reveal className="mx-auto mb-20 max-w-3xl px-5 text-center sm:px-8">
            <RevealLines lines={["Your department,", "finally in one place."]} className={h2} />
            <Link href={primaryCta.href} className={`${pill} mt-10 bg-accent text-accent-ink hover:bg-ink hover:text-paper`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" /> {primaryCta.label}
            </Link>
          </Reveal>
          <footer className="border-t border-ink/10 bg-paper/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-3 px-5 py-8 text-sm text-ink/55 sm:flex-row sm:px-8">
              <p>Campus Connect · Department of Computer Science, University of Sargodha</p>
              <p>Team: {TEAM.join(", ")}</p>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}
