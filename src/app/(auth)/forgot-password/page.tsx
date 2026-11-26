"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "@/actions/auth";
import { initialActionState } from "@/lib/action-result";
import { FormMessage, SubmitButton, TextField } from "@/components/forms";
import { AuthHeading, authInput, authSubmit } from "@/components/auth/auth-heading";

export default function ForgotPasswordPage() {
  const [state, action] = useActionState(requestPasswordReset, initialActionState);
  return (
    <>
      <AuthHeading eyebrow="Reset password" title="Forgot your password?">
        Enter your email and we&apos;ll send you a link to set a new one.
      </AuthHeading>
      <form action={action} className="flex flex-col gap-5" noValidate>
        <FormMessage state={state} />
        <TextField name="email" label="Email" type="email" autoComplete="email" required state={state} inputClassName={authInput} />
        <SubmitButton pendingLabel="Sending…" className={authSubmit}>
          Send reset link
        </SubmitButton>
      </form>
      <Link href="/login" className="mt-6 inline-block text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline">
        ← Back to sign in
      </Link>
    </>
  );
}
