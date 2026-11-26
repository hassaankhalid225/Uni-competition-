/**
 * Campus Connect mark: a geometric "C" whose open end holds a terracotta pin —
 * the notice-board pin and the point where you "connect". Drawn with theme tokens,
 * so it follows the light/dark theme.
 */
export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <svg aria-hidden viewBox="0 0 32 32" width={size} height={size} className="shrink-0">
      <rect width="32" height="32" rx="8" fill="var(--ink)" />
      <path d="M20 10.64A7 7 0 1 0 20 21.36" fill="none" stroke="var(--paper)" strokeWidth="3.6" strokeLinecap="round" />
      <circle cx="22.5" cy="16" r="2.8" fill="var(--accent)" />
    </svg>
  );
}
