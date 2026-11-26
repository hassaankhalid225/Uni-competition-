"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createComment } from "@/actions/posts";
import { initialActionState } from "@/lib/action-result";
import { FormMessage, SubmitButton, inputClass } from "@/components/forms";
import { cx } from "@/components/ui";

export function CommentForm({ postId, parentId, onDone, autoFocus }: { postId: string; parentId?: string; onDone?: () => void; autoFocus?: boolean }) {
  const [state, action] = useActionState(createComment, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      onDone?.();
    }
  }, [state, onDone]);

  const error = state.fieldErrors?.body?.[0];
  return (
    <form ref={formRef} action={action} className="flex flex-col gap-2">
      <input type="hidden" name="postId" value={postId} />
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
      {!state.ok && state.message && !error && <FormMessage state={state} />}
      <label htmlFor={`body-${parentId ?? "root"}`} className="sr-only">
        {parentId ? "Your reply" : "Your comment"}
      </label>
      <textarea
        id={`body-${parentId ?? "root"}`}
        name="body"
        rows={parentId ? 2 : 3}
        required
        maxLength={5000}
        autoFocus={autoFocus}
        placeholder={parentId ? "Write a reply…" : "Add to the discussion…"}
        aria-invalid={Boolean(error)}
        className={cx(inputClass, "resize-y leading-relaxed")}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex justify-end gap-2">
        {onDone && (
          <button type="button" onClick={onDone} className="rounded-lg px-3 text-sm text-ink-muted hover:text-ink">
            Cancel
          </button>
        )}
        <SubmitButton size="sm" pendingLabel="Posting…">
          {parentId ? "Reply" : "Comment"}
        </SubmitButton>
      </div>
    </form>
  );
}

export function ReplyToggle({ postId, parentId }: { postId: string; parentId: string }) {
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="rounded-md px-1.5 py-0.5 text-xs font-medium text-ink-muted hover:bg-sunken hover:text-ink">
        Reply
      </button>
    );
  return (
    <div className="mt-2 w-full">
      <CommentForm postId={postId} parentId={parentId} onDone={() => setOpen(false)} autoFocus />
    </div>
  );
}
