import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/current-user";
import { getClubBySlug } from "@/lib/queries/clubs";
import { PageHeader } from "@/components/ui";
import { NewPostForm } from "./new-post-form";

export const metadata = { title: "New post" };

export default async function NewPostPage({ params }: PageProps<"/clubs/[slug]/new">) {
  const user = await requireUser();
  const club = await getClubBySlug((await params).slug, user.id);
  if (!club) notFound();
  if (!club.isMember && !club.isModerator && user.role !== "admin") redirect(`/clubs/${club.slug}`);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader eyebrow={club.name} title="Start a discussion" />
      <div className="rounded-xl border border-line bg-surface p-5 sm:p-6">
        <NewPostForm clubId={club.id} />
      </div>
    </div>
  );
}
