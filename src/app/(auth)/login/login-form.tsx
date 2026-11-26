"use client";

import { useActionState, useRef } from "react";
import { login } from "@/actions/auth";
import { initialActionState } from "@/lib/action-result";
import { FormMessage, SubmitButton, TextField } from "@/components/forms";

const DEMO_ACCOUNTS = [
  { label: "HOD (admin)", email: "hod@campus.test" },
  { label: "Head CR (admin)", email: "headcr@campus.test" },
  { label: "Moderator", email: "moderator@campus.test" },
  { label: "Student", email: "student@campus.test" },
];

export function LoginForm() {
  const [state, action] = useActionState(login, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  function fill(email: string) {
    const form = formRef.current;
    if (!form) return;
    (form.elements.namedItem("email") as HTMLInputElement).value = email;
    (form.elements.namedItem("password") as HTMLInputElement).value = "campus123";
  }

  return (
    <>
      <form ref={formRef} action={action} className="flex flex-col gap-4" noValidate>
        <FormMessage state={state} />
        <TextField name="email" label="University email" type="email" autoComplete="email" required state={state} />
        <TextField name="password" label="Password" type="password" autoComplete="current-password" required state={state} />
        <SubmitButton pendingLabel="Signing in…" className="mt-2 w-full">
          Sign in
        </SubmitButton>
      </form>

      <div className="mt-8 rounded-xl border border-line bg-surface p-4">
        <p className="text-sm font-medium">Demo accounts</p>
        <p className="mt-0.5 text-xs text-ink-muted">Sample data for evaluation. Password: campus123</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((a) => (
            <button
              key={a.email}
              type="button"
              onClick={() => fill(a.email)}
              className="rounded-lg border border-line px-2.5 py-2 text-left text-xs text-ink-soft transition-colors hover:border-accent hover:text-ink"
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
