"use client";

import { useActionState } from "react";
import { updatePassword } from "@/actions/auth";
import { initialActionState } from "@/lib/action-result";
import { FormMessage, SubmitButton } from "@/components/forms";
import { PasswordField } from "@/components/auth/password-field";
import { authSubmit } from "@/components/auth/auth-heading";

export function ResetPasswordForm() {
  const [state, action] = useActionState(updatePassword, initialActionState);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormMessage state={state} />
      <PasswordField label="New password" autoComplete="new-password" state={state} showStrength />
      <PasswordField name="confirm" label="Confirm new password" autoComplete="new-password" state={state} />
      <SubmitButton pendingLabel="Saving…" className={authSubmit}>
        Save new password
      </SubmitButton>
    </form>
  );
}
