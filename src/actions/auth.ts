"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, users } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth/session";
import { loginSchema, registerSchema } from "@/lib/validation";
import { validationFailure, type ActionState } from "@/lib/action-result";

export async function register(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationFailure(parsed.error);
  const { name, email, password } = parsed.data;

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing.length) return { ok: false, fieldErrors: { email: ["An account with this email already exists"] } };

  // Self-registration always creates a student. Admins are provisioned by the department.
  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(users).values({ name, email, passwordHash }).returning({ id: users.id });
  await createSession(user.id);
  redirect("/clubs?welcome=1");
}

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationFailure(parsed.error);

  const [user] = await db.select().from(users).where(eq(users.email, parsed.data.email));
  const valid = user && (await bcrypt.compare(parsed.data.password, user.passwordHash));
  // Same message either way, so the form doesn't reveal which emails are registered.
  if (!valid) return { ok: false, message: "Invalid email or password." };

  await createSession(user.id);
  redirect("/");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
