import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Runs before every page request: refreshes the Supabase session cookie when it is close to
// expiring, so Server Components always see a valid session. Access control itself happens in
// the pages and server actions, never here.
export async function proxy(request: NextRequest) {
  // If Supabase sends an OAuth / email `code` to a page other than the callback (it falls back to
  // the Site URL when a redirect isn't allow-listed), forward it to the callback to finish sign-in.
  const { pathname, searchParams } = request.nextUrl;
  if (searchParams.has("code") && !pathname.startsWith("/auth/callback")) {
    const target = request.nextUrl.clone();
    target.pathname = "/auth/callback";
    target.search = `?code=${encodeURIComponent(searchParams.get("code")!)}&next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(target);
  }

  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });
  await supabase.auth.getClaims();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|landing/|icon.svg|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|gif)$).*)"],
};
