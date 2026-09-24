import { NextResponse, type NextRequest } from "next/server";

// Comprueba la contraseña compartida (ACCESS_PASSWORD) y, si es correcta,
// guarda la cookie que deja pasar el middleware.
export async function POST(request: NextRequest) {
  const accessKey = process.env.ACCESS_KEY;
  const password = process.env.ACCESS_PASSWORD;
  if (!accessKey || !password) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  if (typeof body.password !== "string" || body.password.trim() !== password) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("kibito_pass", accessKey, {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 90,
  });
  return res;
}
