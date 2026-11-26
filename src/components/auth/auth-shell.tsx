import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { PhysicsStage } from "@/components/landing/hero-scene";

/** Shared look for sign in, sign up and password pages: 3D stage on one side, form on the other. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh bg-paper lg:grid-cols-[1.05fr_1fr]">
      {/* Brand stage: the same interactive 3D pile as the landing hero */}
      <section className="p-3 lg:sticky lg:top-0 lg:h-dvh lg:p-4">
        <div className="relative h-44 overflow-hidden rounded-[24px] bg-night text-snow sm:h-56 lg:h-full lg:rounded-[28px] dark:bg-[#22252c]">
          <PhysicsStage distance={26} offsetY={-2.5} />
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-5 lg:p-9">
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-snow/70">
              <span>Campus Connect</span>
              <span className="hidden sm:inline">University of Sargodha</span>
            </div>
            <div className="hidden lg:block">
              <p className="max-w-md text-5xl font-normal leading-[1.02] tracking-[-0.04em] xl:text-6xl">
                Your department,
                <br />
                in one place.
              </p>
              <p className="mt-5 max-w-sm font-mono text-[11px] uppercase leading-relaxed tracking-[0.16em] text-snow/60">
                Clubs · Discussions · Official announcements · Event calendar
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col px-5 pb-10 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between py-5">
          <Link href="/welcome" className="flex items-center gap-2.5">
            <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-paper">
              <span className="font-display text-base font-bold">C</span>
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-paper" />
            </span>
            <span className="text-[17px] font-medium tracking-[-0.02em]">Campus Connect</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/welcome" className="hidden rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted hover:text-ink sm:inline">
              ← Home
            </Link>
            <ThemeToggle className="text-ink-muted hover:bg-sunken hover:text-ink" />
          </div>
        </header>
        <div className="flex flex-1 items-center">
          <div className="mx-auto w-full max-w-[420px] py-8">{children}</div>
        </div>
      </section>
    </div>
  );
}
