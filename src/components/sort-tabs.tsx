import Link from "next/link";
import { cx } from "./ui";

export function SortTabs({ basePath, current }: { basePath: string; current: "new" | "top" }) {
  const tabs = [
    { value: "new", label: "Newest" },
    { value: "top", label: "Top" },
  ] as const;
  return (
    <div role="tablist" aria-label="Sort posts" className="inline-flex rounded-lg border border-line bg-sunken p-0.5">
      {tabs.map((t) => (
        <Link
          key={t.value}
          role="tab"
          aria-selected={current === t.value}
          href={t.value === "new" ? basePath : `${basePath}?sort=top`}
          className={cx(
            "rounded-md px-3 py-1 text-sm transition-colors",
            current === t.value ? "bg-surface font-medium text-ink shadow-sm ring-1 ring-line" : "text-ink-muted hover:text-ink",
          )}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}

export function parseSort(value: string | string[] | undefined): "new" | "top" {
  return value === "top" ? "top" : "new";
}
