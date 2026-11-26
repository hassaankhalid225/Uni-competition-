"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cx } from "./ui";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarLink({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  const active = isActive(usePathname(), href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cx(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-[15px] transition-colors",
        active ? "bg-surface font-medium text-ink shadow-[0_1px_0_var(--line)] ring-1 ring-line" : "text-ink-soft hover:bg-sunken hover:text-ink",
      )}
    >
      <span className={cx("shrink-0", active ? "text-accent" : "text-ink-muted")}>{icon}</span>
      {children}
    </Link>
  );
}

export function TabLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  const active = isActive(usePathname(), href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cx("flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium", active ? "text-accent" : "text-ink-muted")}
    >
      {icon}
      <span className="truncate">{label}</span>
    </Link>
  );
}
