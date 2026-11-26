// Makes sure each demo account exists in Supabase Auth and returns its user id, so the seeded
// profile rows share the same id. Uses the service-role key when available (works even with
// email confirmation on); otherwise signs in / signs up with the public key (needs "Confirm
// email" turned off in Supabase). Script-only: never imported by the app.
import { createClient } from "@supabase/supabase-js";

export type ResolveAuthUser = (email: string, password: string, name: string) => Promise<string>;

export function supabaseUserResolver(): ResolveAuthUser | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !(service || anon)) return null;
  const opts = { auth: { persistSession: false, autoRefreshToken: false } };

  if (service) {
    const admin = createClient(url, service, opts);
    return async (email, password, name) => {
      const created = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name } });
      if (created.data.user) return created.data.user.id;
      for (let page = 1; page < 20; page++) {
        const { data } = await admin.auth.admin.listUsers({ page, perPage: 200 });
        const found = data.users.find((u) => u.email === email);
        if (found) {
          await admin.auth.admin.updateUserById(found.id, { password, email_confirm: true });
          return found.id;
        }
        if (data.users.length < 200) break;
      }
      throw new Error(`Could not create or find ${email}: ${created.error?.message}`);
    };
  }

  return async (email, password, name) => {
    const client = createClient(url, anon!, opts);
    const signIn = await client.auth.signInWithPassword({ email, password });
    if (signIn.data.user) return signIn.data.user.id;
    const signUp = await client.auth.signUp({ email, password, options: { data: { name } } });
    if (signUp.data.user && signUp.data.session) return signUp.data.user.id;
    throw new Error(
      `Could not sign up ${email}: ${signUp.error?.message ?? "email confirmation is on"}. ` +
        `Turn off "Confirm email" in Supabase or set SUPABASE_SERVICE_ROLE_KEY.`,
    );
  };
}
