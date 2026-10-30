import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { isAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INTRO_STATUSES = ["pending", "approved", "rejected", "done"];

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { data, error } = await getSupabaseServerClient()
    .from("intro_requests")
    .select("id, founder_name, founder_email, startup_name, contact_requested, reason, status, created_at, decided_at, admin_note")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ intros: data });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id, status, admin_note } = await req.json().catch(() => ({}));
  if (!Number.isInteger(id) || !INTRO_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Datos no válidos" }, { status: 400 });
  }
  const { data, error } = await getSupabaseServerClient()
    .from("intro_requests")
    .update({
      status,
      admin_note: typeof admin_note === "string" && admin_note.trim() ? admin_note.trim().slice(0, 1000) : null,
      decided_at: status === "pending" ? null : new Date().toISOString(),
      decided_by: status === "pending" ? null : "admin",
    })
    .eq("id", id)
    .select("id, status, decided_at, admin_note")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ intro: data });
}
