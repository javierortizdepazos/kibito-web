import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { isAdmin } from "@/lib/adminAuth";
import { EDITABLE_COLLECTIONS, findCollection } from "@/lib/contentConfig";
import { getCollectionRows, saveCollectionRows, syncMirror } from "@/lib/contentStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ROWS = 2000;

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const key = req.nextUrl.searchParams.get("key");
  if (!key) {
    return NextResponse.json({ collections: EDITABLE_COLLECTIONS.map((c) => ({ key: c.key, label: c.label, syncsChatbot: Boolean(c.mirror) })) });
  }
  if (!findCollection(key)) return NextResponse.json({ error: "Colección desconocida" }, { status: 400 });
  try {
    return NextResponse.json({ key, rows: await getCollectionRows(getSupabaseServerClient(), key) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { key, rows } = await req.json().catch(() => ({}));
  const collection = typeof key === "string" ? findCollection(key) : undefined;
  if (!collection) return NextResponse.json({ error: "Colección desconocida" }, { status: 400 });
  if (!Array.isArray(rows) || rows.length > MAX_ROWS || rows.some((r) => !r || typeof r !== "object" || Array.isArray(r))) {
    return NextResponse.json({ error: "Formato de filas no válido" }, { status: 400 });
  }

  const sb = getSupabaseServerClient();
  try {
    await saveCollectionRows(sb, collection.key, rows);
  } catch (err: any) {
    return NextResponse.json({ error: `No se ha podido guardar: ${err.message}` }, { status: 500 });
  }

  if (!collection.mirror) return NextResponse.json({ ok: true, synced: null });
  try {
    await syncMirror(sb, collection.mirror, rows);
    return NextResponse.json({ ok: true, synced: true });
  } catch (err: any) {
    console.error("[/api/admin/content] sync error:", err);
    return NextResponse.json({ ok: true, synced: false, syncError: err.message });
  }
}
