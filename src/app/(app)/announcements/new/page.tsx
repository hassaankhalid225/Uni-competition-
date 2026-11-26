import { requireAdmin } from "@/lib/auth/current-user";
import { PageHeader } from "@/components/ui";
import { AnnouncementForm } from "./announcement-form";

export const metadata = { title: "New announcement" };

export default async function NewAnnouncementPage() {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader eyebrow="Official" title="Publish an announcement" description="Visible to every student immediately." />
      <div className="rounded-xl border border-line bg-surface p-5 sm:p-6">
        <AnnouncementForm />
      </div>
    </div>
  );
}
