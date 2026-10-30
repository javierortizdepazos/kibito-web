import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isPublicPath =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/api/login") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname === "/favicon.ico";

  if (isPublicPath) {
    return NextResponse.next();
  }

  const expected = process.env.ACCESS_PASSWORD;
  const hasValidCookie = expected && request.cookies.get("kibito_pw")?.value === expected;

  if (!hasValidCookie) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
