import { requireUser } from "@/lib/auth/current-user";
import { listPosts } from "@/lib/queries/posts";
import { PostCard } from "@/components/post-card";
import { ButtonLink, EmptyState, PageHeader } from "@/components/ui";

export const metadata = { title: "Saved" };

export default async function SavedPage() {
  const user = await requireUser();
  const posts = await listPosts({ viewerId: user.id, onlyBookmarked: true });
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Your library" title="Saved posts" description="Resources and discussions you bookmarked." />
      {posts.length === 0 ? (
        <EmptyState title="Nothing saved yet" action={<ButtonLink href="/" variant="secondary">Browse your feed</ButtonLink>}>
          Tap “Save” on any post to keep it here for later.
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
