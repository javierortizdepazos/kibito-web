import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// El founder solo puede consultar las solicitudes cuyos tokens guardó su navegador.
export async function POST(req: NextRequest) {
  const { tokens } = await req.json().catch(() => ({ tokens: [] }));
  const valid = Array.isArray(tokens) ? tokens.filter((t) => typeof t === "string" && UUID_RE.test(t)).slice(0, 50) : [];
  if (!valid.length) return NextResponse.json({ intros: [] });
  const { data, error } = await getSupabaseServerClient()
    .from("intro_requests")
    .select("public_token, contact_requested, status, created_at, decided_at, admin_note")
    .in("public_token", valid);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ intros: data });
}
