import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { getStoredContent } from "@/lib/contentStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const content = await getStoredContent(getSupabaseServerClient());
    return NextResponse.json(content, { headers: { "Cache-Control": "no-store" } });
  } catch (err: any) {
    console.error("[/api/content] error:", err);
    return NextResponse.json({}, { status: 200 });
  }
}
