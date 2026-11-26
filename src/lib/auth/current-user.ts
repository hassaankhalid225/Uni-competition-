import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, users } from "@/lib/db";
import { readSessionUserId } from "./session";

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
 * The signed-in user, or null. Our own signed session cookie says *who* (email/password or
 * Google, see actions/auth.ts and app/auth/callback); the `users` table in Neon says *what they
 * may do* (role). Cached for the duration of one request.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const userId = await readSessionUserId();
  if (!userId) return null;
  const [profile] = await db.select(profileColumns).from(users).where(eq(users.id, userId));
  return profile ?? null;
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
