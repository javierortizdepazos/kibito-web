import { NextRequest, NextResponse } from "next/server";
import { SITE_COOKIE, SITE_PURPOSE, safeEqual, signToken } from "@/lib/authToken";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  const expected = process.env.ACCESS_PASSWORD;

  if (!expected || typeof password !== "string" || !safeEqual(password, expected)) {
    // Frena los intentos en bucle sin necesitar un almacén de rate limiting.
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SITE_COOKIE, await signToken(expected, SITE_PURPOSE), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
  return res;
}
