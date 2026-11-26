"use client";

import { useActionState } from "react";
import { register } from "@/actions/auth";
import { initialActionState } from "@/lib/action-result";
import { FormMessage, SubmitButton, TextField } from "@/components/forms";
import { PasswordField } from "@/components/auth/password-field";
import { authInput, authSubmit } from "@/components/auth/auth-heading";

export function RegisterForm() {
  const [state, action] = useActionState(register, initialActionState);
  if (state.ok && state.message) {
    return (
      <div role="status" className="rounded-2xl border border-line bg-surface p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-success">Check your inbox</p>
        <p className="mt-2 text-lg">{state.message}</p>
      </div>
    );
  }
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormMessage state={state} />
      <TextField name="name" label="Full name" autoComplete="name" required state={state} inputClassName={authInput} />
      <TextField name="email" label="Email" type="email" autoComplete="email" required state={state} inputClassName={authInput} />
      <PasswordField autoComplete="new-password" state={state} showStrength />
      <SubmitButton pendingLabel="Creating account…" className={authSubmit}>
        Create account
      </SubmitButton>
      <p className="text-center text-xs text-ink-muted">New accounts join as students. Admin roles are assigned by the department.</p>
    </form>
  );
}
