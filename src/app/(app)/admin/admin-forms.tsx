"use client";

import { useActionState, useState } from "react";
import { assignModerator, reviewClubRequest } from "@/actions/admin";
import { initialActionState } from "@/lib/action-result";
import { FormMessage, SubmitButton, inputClass } from "@/components/forms";
import { cx } from "@/components/ui";

export function ReviewRequestForm({ requestId }: { requestId: string }) {
  const [state, action] = useActionState(reviewClubRequest, initialActionState);
  const [decision, setDecision] = useState<"approved" | "rejected">("approved");
  return (
    <form action={action} className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
      <input type="hidden" name="requestId" value={requestId} />
      <input type="hidden" name="decision" value={decision} />
      <FormMessage state={state} />
      <label htmlFor={`note-${requestId}`} className="sr-only">
        Note to the requester
      </label>
      <input id={`note-${requestId}`} name="note" maxLength={300} placeholder="Optional note to the requester" className={cx(inputClass, "h-9 text-sm")} />
      <div className="flex justify-end gap-2">
        <SubmitButton variant="secondary" size="sm" onClick={() => setDecision("rejected")} pendingLabel="Saving…">
          Reject
        </SubmitButton>
        <SubmitButton size="sm" onClick={() => setDecision("approved")} pendingLabel="Saving…">
          Approve &amp; create club
        </SubmitButton>
      </div>
    </form>
  );
}

export function AssignModeratorForm({ clubs, students }: { clubs: { id: string; name: string }[]; students: { id: string; name: string; email: string }[] }) {
  const [state, action] = useActionState(assignModerator, initialActionState);
  return (
    <form action={action} className="flex flex-col gap-3">
      <FormMessage state={state} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Club
          <select name="clubId" required className={cx(inputClass, "h-10")} defaultValue="">
            <option value="" disabled>
              Choose a club
            </option>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Student
          <select name="userId" required className={cx(inputClass, "h-10")} defaultValue="">
            <option value="" disabled>
              Choose a student
            </option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.email})
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex justify-end">
        <SubmitButton pendingLabel="Assigning…">Assign moderator</SubmitButton>
      </div>
    </form>
  );
}
