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
};

const profileColumns = { id: users.id, name: users.name, email: users.email, role: users.role, adminTitle: users.adminTitle };

/**
 * The signed-in user, or null. Supabase Auth proves *who* the person is (verified JWT claims);
 * our `users` table says *what they may do* (role). Cached for the duration of one request.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub || !claims.email) return null;

  const [profile] = await db.select(profileColumns).from(users).where(eq(users.id, claims.sub));
  if (profile) return profile;

  // First sign-in after confirming an email: create the profile. Self-service accounts are
  // always students; admins are provisioned by the department.
  const meta = (claims.user_metadata ?? {}) as { name?: string };
  const name = (meta.name ?? claims.email.split("@")[0]).slice(0, 80);
  const [created] = await db
    .insert(users)
    .values({ id: claims.sub, email: claims.email.toLowerCase(), name })
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
