import { NextResponse, type NextRequest } from "next/server";

// If Supabase returns the Google sign-in `code` to a page other than the callback (it falls back
// to its Site URL when a redirect isn't allow-listed), forward it to the callback to finish.
// Everything else passes straight through; access control lives in pages and server actions.
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  if (searchParams.has("code") && !pathname.startsWith("/auth/callback")) {
    const target = request.nextUrl.clone();
    target.pathname = "/auth/callback";
    target.search = `?code=${encodeURIComponent(searchParams.get("code")!)}&next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(target);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|landing/|icon.svg|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|gif)$).*)"],
};
