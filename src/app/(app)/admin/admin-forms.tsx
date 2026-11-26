"use client";

import { useActionState } from "react";
import { assignModerator, reviewClubRequest } from "@/actions/admin";
import { initialActionState } from "@/lib/action-result";
import { FormMessage, SubmitButton, inputClass } from "@/components/forms";
import { cx } from "@/components/ui";

export function ReviewRequestForm({ requestId }: { requestId: string }) {
  const [state, action] = useActionState(reviewClubRequest, initialActionState);
  return (
    <form action={action} className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
      <input type="hidden" name="requestId" value={requestId} />
      <FormMessage state={state} />
      <label htmlFor={`note-${requestId}`} className="sr-only">
        Note to the requester
      </label>
      <input id={`note-${requestId}`} name="note" maxLength={300} placeholder="Optional note to the requester" className={cx(inputClass, "h-9 text-sm")} />
      <div className="flex justify-end gap-2">
        <SubmitButton variant="secondary" size="sm" name="decision" value="rejected" pendingLabel="Saving…">
          Reject
        </SubmitButton>
        <SubmitButton size="sm" name="decision" value="approved" pendingLabel="Saving…">
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
        <div className="flex flex-col gap-1.5">
          <label htmlFor="mod-club" className="text-sm font-medium">
            Club
          </label>
          <select id="mod-club" name="clubId" required className={cx(inputClass, "h-10")} defaultValue="">
            <option value="" disabled>
              Choose a club
            </option>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="mod-student" className="text-sm font-medium">
            Student
          </label>
          <select id="mod-student" name="userId" required className={cx(inputClass, "h-10")} defaultValue="">
            <option value="" disabled>
              Choose a student
            </option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.email})
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end">
        <SubmitButton pendingLabel="Assigning…">Assign moderator</SubmitButton>
      </div>
    </form>
  );
}
