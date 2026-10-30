import type { SupabaseClient } from "@supabase/supabase-js";
import STATIC_DATA from "./data.json";
import type { MirrorConfig } from "./contentConfig";

// Contenido editado desde /admin: { key: data }. Lo que no esté en `site_content`
// sigue saliendo de lib/data.json.
export async function getStoredContent(sb: SupabaseClient): Promise<Record<string, any>> {
  const { data, error } = await sb.from("site_content").select("key, data");
  if (error) throw new Error(error.message);
  return Object.fromEntries((data || []).map((r: any) => [r.key, r.data]));
}

export async function getCollectionRows(sb: SupabaseClient, key: string): Promise<any[]> {
  const stored = await getStoredContent(sb);
  const [top, sub] = key.split(".");
  const value = stored[top] ?? (STATIC_DATA as any)[top];
  const rows = sub ? value?.[sub] : value;
  return Array.isArray(rows) ? rows : [];
}

export async function saveCollectionRows(sb: SupabaseClient, key: string, rows: any[]) {
  const [top, sub] = key.split(".");
  let value: any = rows;
  if (sub) {
    const stored = await getStoredContent(sb);
    value = { ...((stored[top] ?? (STATIC_DATA as any)[top]) || {}), [sub]: rows };
  }
  const { error } = await sb.from("site_content").upsert({ key: top, data: value, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}

// Copia la colección a la tabla del chatbot. Inserta primero y solo después borra las
// filas antiguas, así un fallo a mitad nunca deja la tabla vacía.
export async function syncMirror(sb: SupabaseClient, mirror: MirrorConfig, rows: any[]) {
  const { data: existing, error } = await sb.from(mirror.table).select("*");
  if (error) throw new Error(error.message);
  const byKey = new Map((existing || []).map((r: any) => [mirror.matchKey(r), r]));

  const toInsert = rows.map((row) => {
    const base: any = byKey.get(mirror.matchKey(row)) || {};
    const out: Record<string, any> = {};
    for (const col of mirror.cols) {
      const v = col in row ? row[col] : base[col];
      out[col] = v === "" || v === undefined ? null : v;
    }
    return out;
  });

  let insertedIds: any[] = [];
  if (toInsert.length) {
    const { data: inserted, error: insErr } = await sb.from(mirror.table).insert(toInsert).select("id");
    if (insErr) throw new Error(insErr.message);
    insertedIds = (inserted || []).map((r: any) => r.id);
  }
  const keep = new Set(insertedIds);
  const oldIds = (existing || []).map((r: any) => r.id).filter((id: any) => !keep.has(id));
  if (oldIds.length) {
    const { error: delErr } = await sb.from(mirror.table).delete().in("id", oldIds);
    if (delErr) throw new Error(delErr.message);
  }
}
