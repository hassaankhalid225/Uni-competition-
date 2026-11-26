import { signInWithGoogle } from "@/actions/auth";
import { SubmitButton } from "@/components/forms";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.56-5.17 3.56-8.81z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.29 14.29A7.2 7.2 0 0 1 4.91 12c0-.8.14-1.57.38-2.29v-3.1H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39l4.01-3.1z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.61l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77z" />
    </svg>
  );
}

/** "Continue with Google" (Supabase OAuth). New Google users join as students. */
export function GoogleButton() {
  return (
    <form action={signInWithGoogle}>
      <SubmitButton
        variant="secondary"
        pendingLabel="Opening Google…"
        className="h-12 w-full rounded-full border-line-strong text-[14px] font-medium"
      >
        <GoogleMark /> Continue with Google
      </SubmitButton>
    </form>
  );
}

export function OrDivider() {
  return (
    <div className="my-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">
      <span className="h-px flex-1 bg-line" /> or with email <span className="h-px flex-1 bg-line" />
    </div>
  );
}
