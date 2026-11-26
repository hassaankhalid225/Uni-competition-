"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db, users } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/validation";
import { validationFailure, type ActionState } from "@/lib/action-result";

// Email + password accounts live entirely in our Neon database (bcrypt hashes, our own session
// cookie, no confirmation emails). Supabase is used only for "Continue with Google".

/** Public URL of this deployment, used as the OAuth return address. */
async function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export async function register(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationFailure(parsed.error);
  const { name, email, password } = parsed.data;

  const [existing] = await db.select({ id: users.id, passwordHash: users.passwordHash }).from(users).where(eq(users.email, email));
  if (existing) {
    return {
      ok: false,
      fieldErrors: {
        email: [existing.passwordHash ? "An account with this email already exists. Sign in instead." : "This email signs in with Google. Use “Continue with Google”."],
      },
    };
  }

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
  if (user && !user.passwordHash) return { ok: false, message: "This account signs in with Google. Use “Continue with Google”." };
  const valid = user?.passwordHash && (await bcrypt.compare(parsed.data.password, user.passwordHash));
  // Same message either way, so the form doesn't reveal which emails are registered.
  if (!valid) return { ok: false, message: "Invalid email or password." };

  await createSession(user.id);
  redirect("/");
}

/** Starts "Continue with Google": Supabase sends the user to Google, then back to /auth/callback. */
export async function signInWithGoogle() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${await siteOrigin()}/auth/callback` },
  });
  if (error || !data.url) redirect("/login?error=google");
  redirect(data.url);
}

export async function logout() {
  await destroySession();
  redirect("/welcome");
}
