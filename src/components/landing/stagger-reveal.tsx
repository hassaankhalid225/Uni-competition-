"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Wraps a list/grid; when it scrolls into view each direct child rises, scales up and fades in,
 * staggered by `step` ms. Motion lives in globals.css (`.stagger-reveal`) and is disabled under
 * prefers-reduced-motion.
 */
export function StaggerReveal({
  as: Tag = "ul",
  children,
  className = "",
  step = 90,
}: {
  as?: "ul" | "ol" | "div";
  children: ReactNode;
  className?: string;
  step?: number;
}) {
  // One ref type that satisfies every allowed tag.
  const ref = useRef<HTMLUListElement & HTMLOListElement & HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    Array.from(el.children).forEach((child, i) => {
      (child as HTMLElement).style.setProperty("--stagger-delay", `${i * step}ms`);
    });
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.visible = "true";
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [step]);
  return (
    <Tag ref={ref} className={`stagger-reveal ${className}`}>
      {children}
    </Tag>
  );
}
