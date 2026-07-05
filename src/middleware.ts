import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { token }   = req.nextauth;
    const { pathname } = req.nextUrl;

    // ── Admin protection ──────────────────────────────────────────────────
    if (pathname.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        const url = new URL("/login", req.url);
        url.searchParams.set("error", "unauthorized");
        url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
      }
    }

    // ── Deactivated account guard ─────────────────────────────────────────
    // role will be missing if somehow a bad token slips through
    if (!token?.role) {
      const url = new URL("/login", req.url);
      url.searchParams.set("error", "SessionExpired");
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/account/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/admin/:path*",
  ],
};