import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getCurrentUser()) redirect("/");
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden overflow-hidden bg-night px-14 py-12 text-snow lg:flex lg:flex-col">
        <div className="flex items-center gap-2.5">
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg bg-snow text-night">
            <span className="font-display text-lg font-bold">C</span>
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-night" />
          </span>
          <span className="font-display text-xl font-semibold">Campus Connect</span>
        </div>

        <div className="my-auto max-w-lg">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-accent">CS Department</p>
          <h1 className="font-display text-5xl font-semibold leading-[1.05]">
            The department&apos;s notice board, clubs and conversations, in one place.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-snow/70">
            Join the clubs you care about, discuss coursework and projects, and never miss an official
            announcement or departmental event again.
          </p>
        </div>

        <dl className="grid grid-cols-3 gap-6 border-t border-snow/15 pt-8 text-sm">
          {[
            ["Clubs", "Topic-based communities with their own feeds"],
            ["Official", "Announcements straight from Head CR, Head GR and HOD"],
            ["Calendar", "Every upcoming and past departmental event"],
          ].map(([term, desc]) => (
            <div key={term}>
              <dt className="font-display text-lg font-semibold text-snow">{term}</dt>
              <dd className="mt-1 text-snow/60">{desc}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="relative flex items-center justify-center px-5 py-10 sm:px-10">
        <ThemeToggle className="absolute right-4 top-4 text-ink-muted hover:bg-sunken hover:text-ink" />
        <div className="w-full max-w-sm">{children}</div>
      </section>
    </div>
  );
}
