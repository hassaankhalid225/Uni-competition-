import { joinClub, leaveClub } from "@/actions/clubs";
import { SubmitButton } from "./forms";

export function MembershipButton({ clubId, isMember, isModerator, size = "sm" }: { clubId: string; isMember: boolean; isModerator: boolean; size?: "sm" | "md" }) {
  if (isModerator) return null; // moderators can't leave; an admin must unassign them first
  return (
    <form action={isMember ? leaveClub : joinClub}>
      <input type="hidden" name="clubId" value={clubId} />
      <SubmitButton size={size} variant={isMember ? "secondary" : "primary"} pendingLabel={isMember ? "Leaving…" : "Joining…"}>
        {isMember ? "Leave" : "Join"}
      </SubmitButton>
    </form>
  );
}
