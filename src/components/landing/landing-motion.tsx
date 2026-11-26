"use client";

// Landing-page-only motion helpers: smooth scrolling, the intro counter, line-by-line headline
// reveals and a scroll-drawn accent arc. Every effect is skipped for prefers-reduced-motion.
import { useEffect, useRef, useState, type ReactNode } from "react";
import Lenis from "lenis";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Inertia smooth scrolling for the landing page. */
export function SmoothScroll() {
  useEffect(() => {
    if (reducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.1, anchors: true });
    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);
  return null;
}

/**
 * Brand intro, once per browser session: the Campus Connect mark draws itself on warm paper,
 * the terracotta pin drops in, the wordmark rises letter by letter while a hairline progress bar
 * fills, then the screen opens as a circle from the pin. Waits for the page to finish loading
 * (max ~2.4s) so the 3D hero is ready underneath. Skipped for reduced motion.
 */
export function IntroLoader() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"run" | "open" | "gone">("run");

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("cc-intro") === "1";
      sessionStorage.setItem("cc-intro", "1");
    } catch {}
    if (seen || reducedMotion()) {
      setPhase("gone");
      return;
    }
    document.documentElement.style.overflow = "hidden";
    const start = performance.now();
    let loaded = document.readyState === "complete";
    const onLoad = () => (loaded = true);
    window.addEventListener("load", onLoad);
    let frame = requestAnimationFrame(function tick(now) {
      const elapsed = now - start;
      // Ease toward 90% on a timer; the last 10% waits for the page load (or 2.4s at most).
      const timed = Math.min(elapsed / 1500, 1);
      const p = Math.round((1 - Math.pow(1 - timed, 3)) * 90 + ((loaded && elapsed > 1100) || elapsed > 2400 ? 10 : 0));
      setProgress(p);
      if (p >= 100) setTimeout(() => setPhase("open"), 200);
      else frame = requestAnimationFrame(tick);
    });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  useEffect(() => {
    if (phase !== "open") return;
    const t = setTimeout(() => {
      setPhase("gone");
      document.documentElement.style.overflow = "";
    }, 900);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "gone") return null;
  const word = "Campus Connect";
  return (
    <div
      aria-hidden
      className="intro-loader fixed inset-0 z-[60] flex flex-col items-center justify-center bg-paper text-ink"
      data-phase={phase}
    >
      {/* faint blueprint grid, same as the hero */}
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_50%_45%_at_50%_50%,black,transparent_80%)]" />

      <svg viewBox="0 0 96 96" className="intro-mark relative h-24 w-24 sm:h-28 sm:w-28">
        <rect className="intro-tile" x="4" y="4" width="88" height="88" rx="24" fill="var(--ink)" />
        <path className="intro-c" d="M60 31.9A21 21 0 1 0 60 64.1" fill="none" stroke="var(--paper)" strokeWidth="10.8" strokeLinecap="round" pathLength={1} />
        <circle className="intro-pin" cx="67.5" cy="48" r="8.4" fill="var(--accent)" />
      </svg>

      <p className="relative mt-7 flex overflow-hidden text-2xl font-normal tracking-[-0.03em] sm:text-3xl">
        {[...word].map((ch, i) => (
          <span key={i} className="intro-letter inline-block" style={{ animationDelay: `${450 + i * 35}ms` }}>
            {ch === " " ? "\u00a0" : ch}
          </span>
        ))}
      </p>
      <p className="intro-sub relative mt-3 font-mono text-[10px] uppercase tracking-[0.24em] text-ink-muted">
        University of Sargodha · CS Department
      </p>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-6 pb-6 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted sm:px-10 sm:pb-8">
        <span>Loading your campus</span>
        <span className="tabular-nums text-ink">{String(progress).padStart(3, "0")}</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-line">
        <div className="h-full origin-left bg-accent transition-transform duration-150" style={{ transform: `scaleX(${progress / 100})` }} />
      </div>
    </div>
  );
}

/** A hand-drawn stroke under a word, drawn after its headline line reveals (sits below descenders). */
export function Swoosh({ children }: { children: ReactNode }) {
  return (
    <span className="fx-swoosh">
      {children}
      <svg viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden>
        <path d="M4 15 C 70 5, 150 4, 220 10 S 285 18, 296 9" pathLength={1} />
      </svg>
    </span>
  );
}

/** Reveals each line of a headline by sliding it up from behind a mask when it scrolls into view. */
export function RevealLines({ lines, as: Tag = "h2", className = "" }: { lines: ReactNode[]; as?: "h1" | "h2"; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.dataset.visible = "true";
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal-lines ${className}`}>
      {lines.map((line, i) => (
        <span key={i} className="line">
          <span style={{ transitionDelay: `${i * 90}ms` }}>{line}</span>
        </span>
      ))}
    </Tag>
  );
}

/**
 * A long ribbon that draws itself across its whole section as you scroll: it enters at the top
 * left, sweeps behind the headline and leaves at the bottom right, finishing as the section ends.
 */
export function ScrollArc({ className = "" }: { className?: string }) {
  const ref = useRef<SVGPathElement>(null);
  useEffect(() => {
    const path = ref.current;
    const host = path?.closest("section");
    if (!path || !host) return;
    if (reducedMotion()) {
      path.style.strokeDashoffset = "0";
      return;
    }
    let frame = 0;
    const update = () => {
      const r = host.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the section's top enters the bottom of the screen, 1 when its end reaches mid-screen.
      const t = Math.min(Math.max((vh - r.top) / (r.height + vh * 0.5), 0), 1);
      path.style.strokeDashoffset = String(1 - t);
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <svg viewBox="0 0 1440 1200" preserveAspectRatio="xMidYMin slice" fill="none" aria-hidden className={`pointer-events-none ${className}`}>
      <path
        ref={ref}
        d="M -120 40 C 260 -10, 560 150, 600 420 S 380 880, 800 960 S 1380 780, 1600 1180"
        stroke="currentColor"
        strokeWidth="26"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset="1"
      />
    </svg>
  );
}

/** Small uppercase mono label row with "+" marks, used as a section divider. */
export function MarkerRow({ label }: { label: string }) {
  return (
    <div aria-hidden className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted">
      <span>+</span>
      <span className="hidden sm:inline">+</span>
      <span>{label}</span>
      <span className="hidden sm:inline">+</span>
      <span>+</span>
    </div>
  );
}

/** Splits a word into letters that start scattered (stable pseudo-random offsets) and settle
 * when the parent RevealLines becomes visible; hovering the word scatters it again. */
export function ScatterWord({ text }: { text: string }) {
  let seed = text.length * 97;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  return (
    <span className="fx-scatter" aria-label={text}>
      {[...text].map((ch, i) => (
        <span
          key={i}
          aria-hidden
          style={{
            ["--dx" as string]: `${(rnd() * 0.5).toFixed(2)}em`,
            ["--dy" as string]: `${(rnd() * 0.6).toFixed(2)}em`,
            ["--r" as string]: `${Math.round(rnd() * 40)}deg`,
            transitionDelay: `${300 + i * 45}ms`,
          }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}
