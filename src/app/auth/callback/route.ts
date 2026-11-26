import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, users } from "@/lib/db";
import { createSession } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Return point of "Continue with Google". Supabase verifies the Google sign-in; we then find or
// create the matching profile in Neon (linked by email), start OUR session, and drop the
// short-lived Supabase session — the rest of the app never talks to Supabase.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const nextParam = searchParams.get("next") ?? "/";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";
  const code = searchParams.get("code");
  if (!code) return NextResponse.redirect(`${origin}/login?error=google`);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  const google = data?.user;
  if (error || !google?.email) return NextResponse.redirect(`${origin}/login?error=google`);

  const email = google.email.toLowerCase();
  const meta = (google.user_metadata ?? {}) as { full_name?: string; name?: string; avatar_url?: string; picture?: string };
  const name = (meta.full_name ?? meta.name ?? email.split("@")[0]).slice(0, 80);
  const avatarUrl = meta.avatar_url ?? meta.picture ?? null;

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  let userId = existing?.id;
  if (userId) {
    if (avatarUrl) await db.update(users).set({ avatarUrl }).where(eq(users.id, userId));
  } else {
    // New Google users join as students; admins are provisioned by the department.
    const [created] = await db.insert(users).values({ email, name, avatarUrl }).returning({ id: users.id });
    userId = created.id;
  }

  await createSession(userId);
  await supabase.auth.signOut({ scope: "local" });
  return NextResponse.redirect(`${origin}${next === "/" ? "/" : next}`);
}
