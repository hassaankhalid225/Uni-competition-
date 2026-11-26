import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold">We couldn&apos;t find that page</h1>
      <p className="mt-3 text-ink-muted">It may have been removed, or the link is wrong.</p>
      <ButtonLink href="/" className="mt-6">
        Back to Campus Connect
      </ButtonLink>
    </div>
  );
}
