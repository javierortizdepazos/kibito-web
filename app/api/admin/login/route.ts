import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_PURPOSE, safeEqual, signToken } from "@/lib/authToken";
import { isAdmin, isAdminConfigured } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  return NextResponse.json({ configured: isAdminConfigured(), admin: await isAdmin(req) });
}

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return NextResponse.json({ ok: false, error: "ADMIN_PASSWORD no está configurada." }, { status: 503 });

  if (typeof password !== "string" || !safeEqual(password, expected)) {
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, await signToken(expected, ADMIN_PURPOSE), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
