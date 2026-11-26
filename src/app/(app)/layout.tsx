import Link from "next/link";
import { Bookmark, CalendarDays, Home, LayoutGrid, LogOut, Megaphone, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { listMyClubs } from "@/lib/queries/clubs";
import { logout } from "@/actions/auth";
import { SidebarLink, TabLink } from "@/components/nav-link";
import { Avatar, Badge, ClubMark } from "@/components/ui";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark } from "@/components/brand-mark";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/clubs", label: "Clubs", icon: LayoutGrid },
  { href: "/announcements", label: "Announcements", short: "News", icon: Megaphone },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/saved", label: "Saved", icon: Bookmark },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const myClubs = await listMyClubs(user.id);
  const isAdmin = user.role === "admin";

  return (
    <div className="flex min-h-dvh w-full">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line px-4 py-6 lg:flex">
        <Link href="/" className="mb-8 flex items-center gap-2.5 px-2">
          <BrandMark />
          <span className="font-display text-xl font-semibold">Campus Connect</span>
        </Link>
        <nav aria-label="Main" className="flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <SidebarLink key={href} href={href} icon={<Icon size={18} />}>
              {label}
            </SidebarLink>
          ))}
          {isAdmin && (
            <SidebarLink href="/admin" icon={<ShieldCheck size={18} />}>
              Admin console
            </SidebarLink>
          )}
        </nav>

        <div className="mt-8 min-h-0 flex-1 overflow-y-auto">
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">My clubs</p>
          {myClubs.length === 0 ? (
            <p className="px-3 text-sm text-ink-muted">
              You haven&apos;t joined any clubs yet.{" "}
              <Link className="text-accent underline-offset-2 hover:underline" href="/clubs">
                Explore clubs
              </Link>
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {myClubs.map((c) => (
                <li key={c.id}>
                  <Link href={`/clubs/${c.slug}`} className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm text-ink-soft hover:bg-sunken hover:text-ink">
                    <ClubMark name={c.name} slug={c.slug} size="sm" />
                    <span className="truncate">{c.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3 border-t border-line pt-4">
          <Avatar name={user.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-ink-muted">{isAdmin ? user.adminTitle ?? "Admin" : "Student"}</p>
          </div>
          <ThemeToggle className="text-ink-muted hover:bg-sunken hover:text-ink" />
          <form action={logout}>
            <button type="submit" aria-label="Sign out" title="Sign out" className="rounded-lg p-2 text-ink-muted hover:bg-sunken hover:text-ink">
              <LogOut size={18} />
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-paper/90 px-4 py-3 backdrop-blur lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <BrandMark />
            <span className="font-display text-lg font-semibold">Campus Connect</span>
          </Link>
          <div className="flex items-center gap-1">
            {isAdmin && (
              <Link href="/admin" className="rounded-lg p-2 text-ink-soft hover:bg-sunken" aria-label="Admin console">
                <ShieldCheck size={20} />
              </Link>
            )}
            {isAdmin && <Badge tone="accent">{user.adminTitle ?? "Admin"}</Badge>}
            <ThemeToggle className="text-ink-soft hover:bg-sunken" />
            <form action={logout}>
              <button type="submit" aria-label="Sign out" className="rounded-lg p-2 text-ink-muted hover:bg-sunken">
                <LogOut size={20} />
              </button>
            </form>
          </div>
        </header>

        <main id="main" className="flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
          {children}
        </main>

        {/* Mobile tab bar */}
        <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
          {NAV.map(({ href, label, short, icon: Icon }) => (
            <TabLink key={href} href={href} label={short ?? label} icon={<Icon size={20} />} />
          ))}
        </nav>
      </div>
    </div>
  );
}

