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

/** A short 0 → 100 intro counter, shown once per browser session. Content is already rendered beneath. */
export function IntroLoader() {
  const [value, setValue] = useState(0);
  const [phase, setPhase] = useState<"count" | "leave" | "gone">("count");

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
    const start = performance.now();
    const duration = 1100;
    let frame = requestAnimationFrame(function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      setValue(Math.round((1 - Math.pow(1 - t, 3)) * 100));
      if (t < 1) frame = requestAnimationFrame(tick);
      else setTimeout(() => setPhase("leave"), 150);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (phase !== "leave") return;
    const t = setTimeout(() => setPhase("gone"), 700);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "gone") return null;
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[60] flex flex-col justify-between bg-night p-6 text-snow transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] sm:p-10"
      style={{ transform: phase === "leave" ? "translateY(-100%)" : "none" }}
    >
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-snow/60">Campus Connect · University of Sargodha</p>
      <div className="flex items-end justify-between">
        <span className="font-sans text-[22vw] font-normal leading-[0.8] tracking-[-0.06em] tabular-nums sm:text-[14vw]">{value}</span>
        <span className="mb-3 h-3 w-3 rounded-full bg-accent" />
      </div>
    </div>
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
