export function AuthHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-9">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
      <h1 className="mt-3 text-[2.6rem] font-normal leading-[1.02] tracking-[-0.04em] sm:text-5xl">{title}</h1>
      {children && <div className="mt-3 text-[15px] text-ink-muted">{children}</div>}
    </div>
  );
}

export const authInput = "h-12 rounded-xl text-[15px]";
export const authSubmit =
  "mt-2 h-12 w-full rounded-full text-[13px] font-medium uppercase tracking-[0.1em] hover:bg-ink hover:text-paper hover:brightness-100";
