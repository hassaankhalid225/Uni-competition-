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
};

/** The logged-in user, or null. Cached for the duration of one request. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const userId = await readSessionUserId();
  if (!userId) return null;
  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, adminTitle: users.adminTitle })
    .from(users)
    .where(eq(users.id, userId));
  return user ?? null;
});

/** For pages: redirect to /login when signed out. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** For admin-only pages. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/");
  return user;
}
