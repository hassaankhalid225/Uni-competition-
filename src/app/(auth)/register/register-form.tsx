"use client";

import { useActionState } from "react";
import { register } from "@/actions/auth";
import { initialActionState } from "@/lib/action-result";
import { FormMessage, SubmitButton, TextField } from "@/components/forms";

export function RegisterForm() {
  const [state, action] = useActionState(register, initialActionState);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormMessage state={state} />
      <TextField name="name" label="Full name" autoComplete="name" required state={state} />
      <TextField name="email" label="University email" type="email" autoComplete="email" required state={state} />
      <TextField name="password" label="Password" type="password" autoComplete="new-password" hint="At least 8 characters" required state={state} />
      <SubmitButton pendingLabel="Creating account…" className="mt-2 w-full">
        Create account
      </SubmitButton>
    </form>
  );
}
