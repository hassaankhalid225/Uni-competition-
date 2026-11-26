"use client";

import { useActionState, useRef } from "react";
import { login } from "@/actions/auth";
import { initialActionState } from "@/lib/action-result";
import { FormMessage, SubmitButton, TextField } from "@/components/forms";
import { PasswordField } from "@/components/auth/password-field";
import { authInput, authSubmit } from "@/components/auth/auth-heading";

const DEMO_ACCOUNTS = [
  { label: "HOD", role: "Admin", email: "hod@campus.test" },
  { label: "Head CR", role: "Admin", email: "headcr@campus.test" },
  { label: "Hamza", role: "Moderator", email: "moderator@campus.test" },
  { label: "Ayesha", role: "Student", email: "student@campus.test" },
];

export function LoginForm() {
  const [state, action] = useActionState(login, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  function fill(email: string) {
    const form = formRef.current;
    if (!form) return;
    (form.elements.namedItem("email") as HTMLInputElement).value = email;
    const pw = form.elements.namedItem("password") as HTMLInputElement;
    // Update the controlled password field through the native setter so React sees the change.
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(pw, "campus123");
    pw.dispatchEvent(new Event("input", { bubbles: true }));
  }

  return (
    <>
      <form ref={formRef} action={action} className="flex flex-col gap-5" noValidate>
        <FormMessage state={state} />
        <TextField name="email" label="Email" type="email" autoComplete="email" required state={state} inputClassName={authInput} />
        <PasswordField autoComplete="current-password" state={state} />
        <SubmitButton pendingLabel="Signing in…" className={authSubmit}>
          Sign in
        </SubmitButton>
      </form>

      <div className="mt-10">
        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">
          <span className="h-px flex-1 bg-line" /> Demo accounts · password campus123 <span className="h-px flex-1 bg-line" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((a) => (
            <button
              key={a.email}
              type="button"
              onClick={() => fill(a.email)}
              className="flex items-center justify-between rounded-full border border-line-strong px-4 py-2.5 text-left text-sm transition-colors hover:border-accent hover:bg-accent-soft"
            >
              <span className="font-medium">{a.label}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">{a.role}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
