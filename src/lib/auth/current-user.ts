import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, users } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  adminTitle: string | null;
  avatarUrl: string | null;
};

const profileColumns = { id: users.id, name: users.name, email: users.email, role: users.role, adminTitle: users.adminTitle, avatarUrl: users.avatarUrl };

/**
 * The signed-in user, or null. Supabase Auth proves *who* the person is (verified JWT claims);
 * our `users` table says *what they may do* (role). Cached for the duration of one request.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub || !claims.email) return null;

  // Email sign-up stores `name`; Google provides `full_name` / `name` and `avatar_url` / `picture`.
  const meta = (claims.user_metadata ?? {}) as { name?: string; full_name?: string; avatar_url?: string; picture?: string };
  const avatarUrl = meta.avatar_url ?? meta.picture ?? null;

  const [profile] = await db.select(profileColumns).from(users).where(eq(users.id, claims.sub));
  if (profile) {
    if (avatarUrl && avatarUrl !== profile.avatarUrl) {
      await db.update(users).set({ avatarUrl }).where(eq(users.id, profile.id));
      return { ...profile, avatarUrl };
    }
    return profile;
  }

  // First sign-in (Google, or after confirming an email): create the profile. Self-service
  // accounts are always students; admins are provisioned by the department.
  const name = (meta.name ?? meta.full_name ?? claims.email.split("@")[0]).slice(0, 80);
  const [created] = await db
    .insert(users)
    .values({ id: claims.sub, email: claims.email.toLowerCase(), name, avatarUrl })
    .onConflictDoNothing()
    .returning(profileColumns);
  return created ?? null;
});

/** For pages: send signed-out visitors to the landing page (which links to sign in). */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/welcome");
  return user;
}

/** For admin-only pages. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/");
  return user;
}
