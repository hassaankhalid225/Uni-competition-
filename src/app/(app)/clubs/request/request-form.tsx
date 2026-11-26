"use client";

import { useActionState, useEffect, useRef } from "react";
import { requestClub } from "@/actions/clubs";
import { initialActionState } from "@/lib/action-result";
import { FormMessage, SubmitButton, TextAreaField, TextField } from "@/components/forms";

export function RequestClubForm() {
  const [state, action] = useActionState(requestClub, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-5" noValidate>
      <FormMessage state={state} />
      <TextField name="name" label="Club name" required maxLength={60} placeholder="e.g. Robotics & IoT" state={state} />
      <TextAreaField name="description" label="What is it about?" rows={3} required maxLength={300} state={state} />
      <TextAreaField name="reason" label="Why should it exist?" rows={3} required maxLength={500} state={state} hint="Who would join, and what's missing today?" />
      <div className="flex justify-end">
        <SubmitButton pendingLabel="Sending…">Send request</SubmitButton>
      </div>
    </form>
  );
}
