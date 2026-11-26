"use client";

import { useActionState } from "react";
import { publishAnnouncement } from "@/actions/department";
import { initialActionState } from "@/lib/action-result";
import { FormMessage, SubmitButton, TextAreaField, TextField } from "@/components/forms";

export function AnnouncementForm() {
  const [state, action] = useActionState(publishAnnouncement, initialActionState);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormMessage state={state} />
      <TextField name="title" label="Title" required maxLength={150} state={state} />
      <TextAreaField name="body" label="Announcement" rows={7} required state={state} />
      <TextField name="linkUrl" label="Link" type="url" placeholder="https://" state={state} hint="Optional, e.g. a form or schedule." />
      <TextField
        name="attachment"
        label="Attachment"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,text/plain,.docx,.pptx,.zip"
        state={state}
        hint="Optional. Up to 4 MB."
      />
      <p className="text-xs text-ink-muted">The publication date and time are recorded automatically.</p>
      <div className="flex justify-end">
        <SubmitButton pendingLabel="Publishing…">Publish announcement</SubmitButton>
      </div>
    </form>
  );
}
