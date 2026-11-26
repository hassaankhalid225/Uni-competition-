import { Plus, Trash2 } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { listAnnouncements } from "@/lib/queries/department";
import { deleteAnnouncement } from "@/actions/department";
import { AnnouncementCard } from "@/components/department-cards";
import { SubmitButton } from "@/components/forms";
import { ButtonLink, EmptyState, PageHeader } from "@/components/ui";

export const metadata = { title: "Announcements" };

export default async function AnnouncementsPage() {
  const user = await requireUser();
  const isAdmin = user.role === "admin";
  const items = await listAnnouncements();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Official"
        title="Announcements"
        description="Notices from the Head CR, Head GR and HOD."
        actions={
          isAdmin && (
            <ButtonLink href="/announcements/new">
              <Plus size={16} /> New announcement
            </ButtonLink>
          )
        }
      />
      {items.length === 0 ? (
        <EmptyState title="No announcements yet">Official department notices will appear here.</EmptyState>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((a) => (
            <div key={a.id} id={a.id} className="scroll-mt-24">
              <AnnouncementCard a={a}>
                {isAdmin && (
                  <form action={deleteAnnouncement} className="mt-4 flex justify-end border-t border-line pt-3">
                    <input type="hidden" name="id" value={a.id} />
                    <SubmitButton variant="danger" size="sm" pendingLabel="Removing…" confirmMessage="Remove this announcement for everyone?">
                      <Trash2 size={14} /> Remove
                    </SubmitButton>
                  </form>
                )}
              </AnnouncementCard>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
