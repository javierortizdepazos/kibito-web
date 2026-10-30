import { NextResponse, type NextRequest } from "next/server";
import { SITE_COOKIE, SITE_PURPOSE, isValidSession } from "@/lib/authToken";

export async function middleware(request: NextRequest) {
  const isPublicPath =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/api/login") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname === "/favicon.ico";

  if (isPublicPath) {
    return NextResponse.next();
  }

  const ok = await isValidSession(request.cookies.get(SITE_COOKIE)?.value, process.env.ACCESS_PASSWORD, SITE_PURPOSE);
  if (!ok) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // /_vercel/* son los scripts de Analytics que sirve Vercel: no deben redirigir a /login.
  matcher: ["/((?!_next/static|_next/image|_vercel|favicon.ico).*)"],
};
