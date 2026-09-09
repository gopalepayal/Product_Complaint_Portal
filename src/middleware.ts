import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin routes protection ─────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // Admin login page is always publicly accessible
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const session = await auth();

    // Not authenticated → redirect to admin login
    if (!session?.user) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Authenticated but not an ADMIN → redirect to admin login with error
    const role = (session.user as { role?: string }).role;
    if (role !== "ADMIN") {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // ── Admin API routes protection ─────────────────────────────────────────
  if (pathname.startsWith("/api/admin")) {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access only." }, { status: 403 });
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
