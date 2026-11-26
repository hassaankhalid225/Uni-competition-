import { requireAdmin } from "@/lib/auth/current-user";
import { createEvent } from "@/actions/department";
import { EventForm } from "@/components/event-form";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "New event" };

export default async function NewEventPage() {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader eyebrow="Department calendar" title="Create an event" />
      <div className="rounded-xl border border-line bg-surface p-5 sm:p-6">
        <EventForm action={createEvent} submitLabel="Create event" />
      </div>
    </div>
  );
}
