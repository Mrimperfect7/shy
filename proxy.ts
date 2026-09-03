import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth/session";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets/ (public assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|assets).*)",
  ],
};

export default async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  let pathname = url.pathname;
  const hostname = request.headers.get("host") || "";

  let shouldRewrite = false;

  // 1. Subdomain Routing Logic
  const isAdminSubdomain = hostname.startsWith("admin.");
  const isLocal = hostname.includes("localhost") || hostname.includes("127.0.0.1");

  if (isAdminSubdomain) {
    if (pathname === "/login") {
      // Do not rewrite /login to /admin/login so the login page renders
    } else if (!pathname.startsWith("/admin") && !pathname.startsWith("/api")) {
      url.pathname = `/admin${pathname === "/" ? "" : pathname}`;
      pathname = url.pathname;
      shouldRewrite = true;
    }
  } else if (hostname.startsWith("influencer.")) {
    if (pathname === "/login") {
      // Do not rewrite /login so the login page renders
    } else if (!pathname.startsWith("/influencer") && !pathname.startsWith("/api")) {
      url.pathname = `/influencer${pathname === "/" ? "" : pathname}`;
      pathname = url.pathname;
      shouldRewrite = true;
    }
  } else {
    // Block direct access to /admin on the main domain in production
    if (pathname.startsWith("/admin") && !isLocal) {
      url.pathname = "/404";
      return NextResponse.rewrite(url);
    }
  }

  // 2. Auth Protection Logic
  // Admin routes protection
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get("eshara_session")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const session = await verifySession(token);
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Influencer routes protection
  if (pathname.startsWith("/influencer")) {
    const token = request.cookies.get("eshara_session")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const session = await verifySession(token);
    if (!session || session.role !== "INFLUENCER") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Admin API routes protection
  if (pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/auth")) {
    const token = request.cookies.get("eshara_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const session = await verifySession(token);
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Influencer API routes protection
  if (pathname.startsWith("/api/influencer") && !pathname.startsWith("/api/influencer/auth")) {
    const token = request.cookies.get("eshara_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const session = await verifySession(token);
    if (!session || session.role !== "INFLUENCER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (shouldRewrite) {
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
