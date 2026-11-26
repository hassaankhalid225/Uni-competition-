import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/current-user";
import { getEvent } from "@/lib/queries/department";
import { updateEvent } from "@/actions/department";
import { toLocalInputs } from "@/lib/format";
import { EventForm } from "@/components/event-form";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Edit event" };

export default async function EditEventPage({ params }: PageProps<"/events/[id]/edit">) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const event = await getEvent(id);
  if (!event) notFound();
  const { date, time } = toLocalInputs(event.startsAt);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader eyebrow="Department calendar" title="Edit event" />
      <div className="rounded-xl border border-line bg-surface p-5 sm:p-6">
        <EventForm
          action={updateEvent}
          submitLabel="Save changes"
          defaults={{ id: event.id, title: event.title, description: event.description, venue: event.venue, date, time }}
        />
      </div>
    </div>
  );
}
