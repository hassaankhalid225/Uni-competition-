"use client";

// "Four wings in every club": a deck of four playing-card style cards. The section is tall and
// its content sticks to the screen; as you scroll, the cards leave the stacked deck one after
// another, flip over in 3D and settle in a row (2×2 on phones). Driven by scroll position with
// plain CSS 3D transforms. Reduced motion shows the cards face up, no movement.
import { useEffect, useRef, useState } from "react";
import { CalendarDays, Clapperboard, Code2, Palette, type LucideIcon } from "lucide-react";
import { RevealLines } from "./landing-motion";

type Wing = { key: string; name: string; glyph: string; icon: LucideIcon; tasks: string[] };

const WINGS: Wing[] = [
  { key: "media", name: "Media", glyph: "M", icon: Clapperboard, tasks: ["Photography", "Event coverage", "Reels & video", "Social media", "Newsletters"] },
  { key: "graphics", name: "Graphics", glyph: "G", icon: Palette, tasks: ["Posters & flyers", "Club branding", "Slide decks", "UI mockups", "Merch design"] },
  { key: "coding", name: "Coding", glyph: "C", icon: Code2, tasks: ["Workshops", "Hackathon teams", "Club projects", "Code reviews", "Tooling & bots"] },
  { key: "events", name: "Event Management", glyph: "E", icon: CalendarDays, tasks: ["Planning & venues", "Registrations", "Speakers & guests", "Logistics", "On-the-day ops"] },
];

const clamp = (v: number, a = 0, b = 1) => Math.min(Math.max(v, a), b);
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

function CardBack() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[18px] border border-white/10 bg-night [backface-visibility:hidden] [transform:rotateY(180deg)]">
      <svg viewBox="0 0 200 280" className="h-full w-full" aria-hidden>
        <defs>
          <pattern id="cc-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="rgba(244,239,232,0.08)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="200" height="280" fill="url(#cc-grid)" />
        <rect x="12" y="12" width="176" height="256" rx="10" fill="none" stroke="#d2643a" strokeOpacity="0.55" />
        <circle cx="100" cy="140" r="58" fill="none" stroke="#d2643a" strokeOpacity="0.35" />
        <circle cx="100" cy="140" r="40" fill="none" stroke="#f4efe8" strokeOpacity="0.18" />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <circle key={a} cx={100 + Math.cos((a * Math.PI) / 180) * 58} cy={140 + Math.sin((a * Math.PI) / 180) * 58} r="4" fill="#d2643a" />
        ))}
        <rect x="80" y="120" width="40" height="40" rx="9" fill="#f4efe8" />
        <text x="100" y="149" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="26" fill="#17191f">C</text>
        <circle cx="117" cy="123" r="5" fill="#d2643a" />
      </svg>
    </div>
  );
}

function CardFront({ wing, index }: { wing: Wing; index: number }) {
  const Icon = wing.icon;
  return (
    <div className="absolute inset-0 flex flex-col rounded-[18px] border border-line bg-surface p-3.5 text-ink sm:p-5 shadow-[0_30px_60px_-30px_rgba(20,20,30,0.45)] [backface-visibility:hidden]">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">Wing 0{index + 1}</p>
          <h3 className="mt-1 text-[15px] font-medium leading-tight tracking-[-0.02em] sm:text-xl">{wing.name}</h3>
        </div>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-ink sm:h-9 sm:w-9">
          <Icon size={18} />
        </span>
      </div>
      <ul className="mt-3 flex-1 space-y-1.5 text-xs text-ink-soft sm:mt-5 sm:space-y-2 sm:text-sm [&>li:nth-child(n+3)]:hidden sm:[&>li:nth-child(n+3)]:block">
        {wing.tasks.map((t) => (
          <li key={t} className="border-b border-line pb-1.5 sm:pb-2">
            {t}
          </li>
        ))}
      </ul>
      {/* Mirrored footer, like the bottom corner of a playing card */}
      <div className="mt-2 flex rotate-180 items-center justify-between sm:mt-4">
        <span className="truncate text-xs font-medium tracking-[-0.01em] sm:text-sm">{wing.name}</span>
        <span className="text-2xl font-medium leading-none text-accent">{wing.glyph}</span>
      </div>
    </div>
  );
}

export function WingsDeck() {
  const section = useRef<HTMLElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const host = section.current;
    if (!host) return;
    const small = window.matchMedia("(max-width: 767px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onSize = () => setCompact(small.matches);
    onSize();
    small.addEventListener("change", onSize);

    let frame = 0;
    const update = () => {
      const r = host.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 → 1 while the sticky stage is pinned (section height minus one screen).
      const progress = reduce.matches ? 1 : clamp(-r.top / Math.max(r.height - vh, 1));
      const isSmall = small.matches;
      const cardW = isSmall ? Math.min(window.innerWidth * 0.42, 165) : Math.min(window.innerWidth * 0.2, 260);
      const gap = isSmall ? 12 : 22;
      cards.current.forEach((el, i) => {
        if (!el) return;
        const t = ease(clamp((progress - 0.08 - i * 0.12) / 0.45));
        // Final slot: a row of four on desktop, a 2×2 grid on phones.
        const col = isSmall ? i % 2 : i;
        const row = isSmall ? Math.floor(i / 2) : 0;
        const cols = isSmall ? 2 : 4;
        const fx = (col - (cols - 1) / 2) * (cardW + gap);
        const fy = isSmall ? (row - 0.5) * (cardW * 1.3 + gap) + 8 : 0;
        // Start: stacked deck below centre, slightly fanned.
        const sx = (i - 1.5) * 4;
        const sy = vh * 0.32 + i * -3;
        const x = sx + (fx - sx) * t;
        const y = sy + (fy - sy) * t;
        const lift = Math.sin(t * Math.PI) * -60; // arc upward while travelling
        const flip = 180 * (1 - t);
        const tiltZ = (1 - t) * (i - 1.5) * 4 + Math.sin(t * Math.PI) * (i % 2 ? 6 : -6);
        const tiltX = Math.sin(t * Math.PI) * 18;
        el.style.width = `${cardW}px`;
        el.style.height = `${cardW * (isSmall ? 1.3 : 1.4)}px`;
        el.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y + lift}px), ${t * 40}px) rotateX(${tiltX}deg) rotateY(${flip}deg) rotateZ(${tiltZ}deg)`;
        el.style.zIndex = String(t > 0.5 ? 10 + i : 4 - i);
      });
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(frame);
      small.removeEventListener("change", onSize);
    };
  }, []);

  return (
    <section ref={section} data-scene="deck" aria-label="Four wings in every club" className="relative h-[320vh]">
      <div className="sticky top-0 flex h-dvh flex-col overflow-hidden">
        <div className="mx-auto w-full max-w-[1240px] px-5 pt-20 sm:px-8 md:pt-28">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-accent">Inside every club</p>
          <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <RevealLines
              lines={[
                <span key="a" className="inline-flex items-center gap-3">
                  Four wings.
                  <span className="inline-flex gap-1.5" aria-hidden>
                    {WINGS.map((w, i) => {
                      const Icon = w.icon;
                      return (
                        <span key={w.key} className="fx-pop inline-flex h-[0.62em] w-[0.62em] items-center justify-center rounded-full bg-accent text-accent-ink" style={{ transitionDelay: `${700 + i * 120}ms` }}>
                          <Icon className="h-[0.32em] w-[0.32em]" />
                        </span>
                      );
                    })}
                  </span>
                </span>,
                <span key="b" className="font-display italic text-accent">One club.</span>,
              ]}
              className="text-[2.4rem] font-normal leading-[1.08] tracking-[-0.035em] sm:text-6xl"
            />
            <p className="hidden max-w-sm text-[15px] leading-relaxed text-ink/65 sm:block">
              Every club runs on four sub-societies. Scroll to deal the deck and meet each wing.
            </p>
          </div>
        </div>
        <div className="relative flex-1 [perspective:1400px]" style={{ minHeight: compact ? 420 : 380 }}>
          {WINGS.map((w, i) => (
            <div
              key={w.key}
              ref={(el) => {
                cards.current[i] = el;
              }}
              className="absolute left-1/2 top-1/2 will-change-transform [transform-style:preserve-3d]"
            >
              <CardFront wing={w} index={i} />
              <CardBack />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
