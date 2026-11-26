"use client";

import { ButtonLink } from "@/components/ui";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // Server action errors (e.g. permission denied) arrive here. In production Next.js hides the
  // message, so we show a friendly explanation that covers both cases.
  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">Something went wrong</p>
      <h1 className="mt-2 font-display text-3xl font-semibold">That action couldn&apos;t be completed</h1>
      <p className="mt-3 text-ink-muted">
        {process.env.NODE_ENV === "development" ? error.message : "You may not have permission for this action, or the item no longer exists."}
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <button type="button" onClick={reset} className="h-10 rounded-lg border border-line-strong bg-surface px-4 text-sm font-medium hover:bg-sunken">
          Try again
        </button>
        <ButtonLink href="/">Go home</ButtonLink>
      </div>
    </div>
  );
}
