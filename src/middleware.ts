import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-session";

/**
 * Admin protection.
 * - /admin/* pages need a valid signed session (else → /admin/login).
 * - Every /api route needs one too, EXCEPT the few the public shop uses:
 *     POST /api/orders (checkout), GET /api/catalog (endless scroll), /api/admin/login.
 */
function isPublicApi(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const m = req.method;
  if (pathname === "/api/admin/login") return true;
  if (pathname === "/api/orders" && m === "POST") return true;
  if (pathname === "/api/catalog" && m === "GET") return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = await verifySessionToken(req.cookies.get(ADMIN_COOKIE)?.value);

  if (pathname.startsWith("/api/")) {
    if (isPublicApi(req) || authed) return NextResponse.next();
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // /admin pages
  if (pathname === "/admin/login") {
    if (authed) return NextResponse.redirect(new URL("/admin", req.url));
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }
  if (!authed) {
    const url = new URL("/admin/login", req.url);
    if (pathname !== "/admin") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
