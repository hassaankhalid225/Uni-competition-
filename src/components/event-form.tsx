"use client";

import { useActionState } from "react";
import { initialActionState, type ActionState } from "@/lib/action-result";
import { FormMessage, SubmitButton, TextAreaField, TextField } from "./forms";

type EventFormProps = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  defaults?: { id: string; title: string; description: string; venue: string; date: string; time: string };
};

export function EventForm({ action: serverAction, submitLabel, defaults }: EventFormProps) {
  const [state, action] = useActionState(serverAction, initialActionState);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {defaults && <input type="hidden" name="id" value={defaults.id} />}
      <FormMessage state={state} />
      <TextField name="title" label="Title" required maxLength={120} defaultValue={defaults?.title} state={state} />
      <TextAreaField name="description" label="Description" rows={4} required defaultValue={defaults?.description} state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="date" label="Date" type="date" required defaultValue={defaults?.date} state={state} />
        <TextField name="time" label="Time (PKT)" type="time" required defaultValue={defaults?.time} state={state} />
      </div>
      <TextField name="venue" label="Venue" required maxLength={120} defaultValue={defaults?.venue} placeholder="e.g. Auditorium A" state={state} />
      <div className="flex justify-end">
        <SubmitButton pendingLabel="Saving…">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
