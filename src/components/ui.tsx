import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap";
const buttonVariants = {
  primary: "bg-accent text-accent-ink hover:brightness-95",
  secondary: "bg-surface text-ink border border-line-strong hover:bg-sunken",
  ghost: "text-ink-soft hover:bg-sunken hover:text-ink",
  danger: "text-danger hover:bg-danger-soft",
} as const;
const buttonSizes = { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-sm", icon: "h-8 w-8" } as const;

export type ButtonVariant = keyof typeof buttonVariants;
export type ButtonSize = keyof typeof buttonSizes;

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra?: string) {
  return cx(buttonBase, buttonVariants[variant], buttonSizes[size], extra);
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

const badgeTones = {
  neutral: "bg-sunken text-ink-soft border-line",
  accent: "bg-accent-soft text-accent border-transparent",
  success: "bg-success-soft text-success border-transparent",
  warning: "bg-warning-soft text-warning border-transparent",
  danger: "bg-danger-soft text-danger border-transparent",
} as const;

export function Badge({ tone = "neutral", children, className }: { tone?: keyof typeof badgeTones; children: ReactNode; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", badgeTones[tone], className)}>
      {children}
    </span>
  );
}

/** Stable, muted hue per club so each community is recognisable across the app. */
function hueFor(text: string) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

export function ClubMark({ name, slug, size = "md" }: { name: string; slug: string; size?: "sm" | "md" | "lg" }) {
  const hue = hueFor(slug);
  const letters = name
    .replace(/&/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  const dims = { sm: "h-6 w-6 text-[10px] rounded-md", md: "h-10 w-10 text-sm rounded-lg", lg: "h-14 w-14 text-lg rounded-xl" }[size];
  return (
    <span
      aria-hidden
      className={cx("inline-flex shrink-0 items-center justify-center font-display font-semibold", dims)}
      style={{ background: `oklch(0.9 0.05 ${hue})`, color: `oklch(0.35 0.09 ${hue})` }}
    >
      {letters}
    </span>
  );
}

export function Avatar({ name, size = "md", src }: { name: string; size?: "sm" | "md"; src?: string | null }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote provider photo (Google), tiny and cached by the browser
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        className={cx("shrink-0 rounded-full object-cover ring-1 ring-line", size === "sm" ? "h-6 w-6" : "h-9 w-9")}
      />
    );
  }
  const initials = name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-sunken font-medium text-ink-soft ring-1 ring-line",
        size === "sm" ? "h-6 w-6 text-[10px]" : "h-9 w-9 text-xs",
      )}
    >
      {initials}
    </span>
  );
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-accent">{eyebrow}</p>}
        <h1 className="font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-prose text-[15px] text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </header>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("rounded-xl border border-line bg-surface", className)}>{children}</div>;
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line-strong px-6 py-12 text-center">
      <p className="font-display text-xl font-semibold text-ink">{title}</p>
      {children && <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">{children}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
