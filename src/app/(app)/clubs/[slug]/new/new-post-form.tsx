"use client";

import { useActionState } from "react";
import { createPost } from "@/actions/posts";
import { initialActionState } from "@/lib/action-result";
import { FormMessage, SubmitButton, TextAreaField, TextField } from "@/components/forms";

export function NewPostForm({ clubId }: { clubId: string }) {
  const [state, action] = useActionState(createPost, initialActionState);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="clubId" value={clubId} />
      <FormMessage state={state} />
      <TextField name="title" label="Title" required maxLength={150} placeholder="What's this about?" state={state} />
      <TextAreaField name="body" label="Text" rows={6} placeholder="Share details, a question, or context for your link" state={state} hint="Optional if you add a link or file." />
      <TextField name="linkUrl" label="Link" type="url" placeholder="https://" state={state} hint="Optional. Share a resource, repo or article." />
      <TextField
        name="attachment"
        label="Image or document"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,text/plain,.docx,.pptx,.zip"
        state={state}
        hint="Optional. Up to 4 MB: images, PDF, DOCX, PPTX, TXT, ZIP."
      />
      <div className="flex justify-end">
        <SubmitButton pendingLabel="Publishing…">Publish post</SubmitButton>
      </div>
    </form>
  );
}
