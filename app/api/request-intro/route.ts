import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { requestIntro } from "@/lib/kibitoTools";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { founder_name, founder_email, startup_name, contact_requested, reason } = body || {};
    if (!founder_name || !contact_requested || !reason) {
      return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 });
    }

    const sb = getSupabaseServerClient();
    const result = await requestIntro(sb, { founder_name, founder_email, startup_name, contact_requested, reason });
    if ((result as any).error) {
      return NextResponse.json({ error: (result as any).error }, { status: 500 });
    }
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[/api/request-intro] error:", err);
    return NextResponse.json({ error: err.message || "Error desconocido" }, { status: 500 });
  }
}
