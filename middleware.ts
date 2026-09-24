import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Acceso provisional con contraseña compartida, para que el equipo pruebe sin login de Supabase:
  // /acceso pide ACCESS_PASSWORD y, si es correcta, guarda la cookie kibito_pass (= ACCESS_KEY).
  // Sin ACCESS_KEY y ACCESS_PASSWORD definidas todo funciona como antes: login obligatorio.
  const accessKey = process.env.ACCESS_KEY;
  const passwordGate = Boolean(accessKey && process.env.ACCESS_PASSWORD);
  if (passwordGate) {
    if (request.cookies.get("kibito_pass")?.value === accessKey) {
      return NextResponse.next({ request });
    }
    const path = request.nextUrl.pathname;
    if (path.startsWith("/acceso") || path.startsWith("/api/acceso")) {
      return NextResponse.next({ request });
    }
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicPath =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/auth") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname === "/favicon.ico";

  // En entorno local de desarrollo, permitir acceso directo si se activa el bypass
  const isDev = process.env.NODE_ENV === "development";
  const hasBypassCookie = request.cookies.get("kibo_dev_bypass")?.value === "true";
  const hasBypassParam = request.nextUrl.searchParams.get("bypass") === "true";

  if (isDev && hasBypassParam) {
    const cleanUrl = new URL(request.nextUrl.pathname, request.url);
    const redirectRes = NextResponse.redirect(cleanUrl);
    redirectRes.cookies.set("kibo_dev_bypass", "true", { path: "/" });
    return redirectRes;
  }

  if (isDev && hasBypassCookie) {
    return response;
  }

  if (!user && !isPublicPath) {
    const loginUrl = new URL(passwordGate ? "/acceso" : "/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
