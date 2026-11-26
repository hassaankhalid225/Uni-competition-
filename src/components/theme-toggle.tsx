"use client";

import { Moon, Sun } from "lucide-react";
import { cx } from "./ui";

export type Theme = "light" | "dark";
export const THEME_STORAGE_KEY = "cc-theme";

/** Switches between light and dark, remembers the choice, and works on every page. */
export function ThemeToggle({ className }: { className?: string }) {
  function toggle() {
    const root = document.documentElement;
    const next: Theme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode / blocked storage: the theme still changes for this visit.
    }
  }

  // Both icons are rendered and CSS shows the right one, so server and client HTML always match.
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark mode"
      title="Light / dark mode"
      className={cx("inline-flex items-center justify-center rounded-lg p-2 transition-colors", className)}
    >
      <Moon size={18} className="dark:hidden" />
      <Sun size={18} className="hidden dark:block" />
    </button>
  );
}
