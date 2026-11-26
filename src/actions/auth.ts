"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db, users } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { emailSchema, loginSchema, newPasswordSchema, registerSchema } from "@/lib/validation";
import { validationFailure, type ActionState } from "@/lib/action-result";

/** Public URL of this deployment, used in links inside confirmation / reset emails. */
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

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name }, emailRedirectTo: `${await siteOrigin()}/auth/callback` },
  });
  if (error) {
    if (/already registered|already exists/i.test(error.message))
      return { ok: false, fieldErrors: { email: ["An account with this email already exists. Sign in instead."] } };
    if (/password/i.test(error.message)) return { ok: false, fieldErrors: { password: [error.message] } };
    return { ok: false, message: error.message };
  }
  if (!data.user) return { ok: false, message: "Could not create the account. Please try again." };

  // Self-registration always creates a student profile linked to the Supabase user.
  await db.insert(users).values({ id: data.user.id, name, email }).onConflictDoNothing();

  // With email confirmation enabled in Supabase there is no session yet.
  if (!data.session) return { ok: true, message: `We sent a confirmation link to ${email}. Open it to finish signing up.` };
  redirect("/clubs?welcome=1");
}

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationFailure(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (/not confirmed/i.test(error.message)) return { ok: false, message: "Please confirm your email first. Check your inbox for the link." };
    // Same message either way, so the form doesn't reveal which emails are registered.
    return { ok: false, message: "Invalid email or password." };
  }
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
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/welcome");
}

export async function requestPasswordReset(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = emailSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationFailure(parsed.error);
  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await siteOrigin()}/auth/callback?next=/reset-password`,
  });
  // Always the same answer, so the form can't be used to discover registered emails.
  return { ok: true, message: "If an account exists for that email, a reset link is on its way." };
}

export async function updatePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = newPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationFailure(parsed.error);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, message: /session/i.test(error.message) ? "This reset link has expired. Request a new one." : error.message };
  redirect("/?password=updated");
}
