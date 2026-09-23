import type { SupabaseClient } from "@supabase/supabase-js";
import { notifySlackIntroRequest } from "./notifySlack";

// Whitelist de tablas consultables + qué columnas de texto admiten
// coincidencia parcial (ilike). El modelo nunca escribe SQL: solo elige
// tabla + filtros de esta lista.
const SEARCHABLE_TABLES: Record<string, { textCols: string[] }> = {
  team: { textCols: ["name", "position"] },
  alumni: { textCols: ["name", "currently"] },
  portfolio_founders: { textCols: ["name", "company", "fund", "location", "sector"] },
  vcs: { textCols: ["company", "geo_focus", "hq_country", "sector", "stage_focus"] },
  venture_debt: { textCols: ["name", "stage"] },
  public_funding: { textCols: ["name", "type", "sector", "notes"] },
  legal_advisors: { textCols: ["team_lead", "company", "specialization"] },
  recruiters: { textCols: ["name", "company", "type"] },
  press_media: { textCols: ["company", "type", "contact_name"] },
  advisors: { textCols: ["name", "company"] },
  restaurants: { textCols: ["name", "city", "cuisine", "formality", "price_range"] },
  events: { textCols: ["name", "location"] },
  perks: { textCols: ["name", "description"] },
  documents: { textCols: ["title", "category", "related_source_page"] },
};

export async function searchContacts(
  sb: SupabaseClient,
  table: string,
  filters: Record<string, string> = {},
  limit = 12
) {
  const cfg = SEARCHABLE_TABLES[table];
  if (!cfg) return { error: `Tabla no permitida: ${table}` };

  let query = sb.from(table).select("*").limit(limit);
  for (const [col, value] of Object.entries(filters || {})) {
    if (cfg.textCols.includes(col)) {
      query = query.ilike(col, `%${value}%`);
    } else {
      query = query.eq(col, value);
    }
  }

  const { data, error } = await query;
  if (error) return { error: error.message };

  let rows = data || [];
  if (table === "recruiters") {
    rows = rows.map((r: any) => (r.contact_visibility === "request_only" ? { ...r, email: null, _note: "Contacto disponible solo bajo petición de intro." } : r));
  }
  return { table, count: rows.length, results: rows };
}

export async function searchKnowledge(sb: SupabaseClient, queryText: string, limit = 5) {
  // Fallback de texto plano mientras no haya embeddings cargados en knowledge_chunks.
  // En cuanto existan, sustituir por una llamada RPC a una función de Postgres
  // que haga <-> (distancia coseno) con pgvector.
  const { data, error } = await sb
    .from("knowledge_chunks")
    .select("id, source_page, section, content")
    .or(`content.ilike.%${queryText}%,section.ilike.%${queryText}%`)
    .limit(limit);
  if (error) return { error: error.message };
  return { mode: "text_fallback", results: data || [] };
}

export async function requestIntro(
  sb: SupabaseClient,
  input: { founder_name: string; contact_requested: string; reason: string; founder_email?: string; startup_name?: string }
) {
  const row = {
    founder_name: input.founder_name,
    founder_email: input.founder_email ?? null,
    startup_name: input.startup_name ?? null,
    contact_requested: input.contact_requested,
    reason: input.reason,
    status: "pending",
  };
  const { data, error } = await sb.from("intro_requests").insert(row).select().single();
  if (error) return { error: error.message };
  await notifySlackIntroRequest(data);
  return { created: true, request: data };
}

// Declaración base de las tools (formato JSON Schema).
export const TOOL_DEFINITIONS = [
  {
    name: "search_contacts",
    description:
      "Busca contactos o recursos estructurados de Kibo Ventures: equipo, alumni, portfolio founders, fondos VC, " +
      "venture debt, financiación pública, abogados, recruiters, prensa, advisors, restaurantes, eventos, perks o " +
      "documentos/plantillas. Úsala para preguntas con filtros claros, p.ej. 'fondos VC en USA' o 'la plantilla de board deck'.",
    input_schema: {
      type: "object",
      properties: {
        table: { type: "string", enum: Object.keys(SEARCHABLE_TABLES), description: "Qué tabla consultar." },
        filters: {
          type: "object",
          description: "Pares columna->valor a filtrar. Columnas de texto admiten coincidencia parcial; el resto exige valor exacto.",
        },
      },
      required: ["table"],
    },
  },
  {
    name: "search_knowledge",
    description:
      "Busca en las guías internas de Kibo (pitch deck, board meetings, fundraising, reporting, principios). " +
      "Úsala para preguntas abiertas tipo 'cómo explico mi tamaño de mercado'.",
    input_schema: {
      type: "object",
      properties: { query_text: { type: "string", description: "La pregunta o tema a buscar." } },
      required: ["query_text"],
    },
  },
  {
    name: "request_intro",
    description:
      "Crea una solicitud de intro a un contacto (fondo, abogado, recruiter, etc.) en vez de dar el dato de contacto " +
      "directamente. Se manda a aprobación del equipo de Kibo por Slack.",
    input_schema: {
      type: "object",
      properties: {
        founder_name: { type: "string" },
        founder_email: { type: "string" },
        startup_name: { type: "string" },
        contact_requested: { type: "string", description: "Nombre del fondo/persona/empresa a la que se pide la intro." },
        reason: { type: "string", description: "Por qué quiere el founder esta intro." },
      },
      required: ["founder_name", "contact_requested", "reason"],
    },
  },
  {
    name: "flag_unanswered",
    description:
      "Llama a esta tool cuando NO puedas responder la pregunta del founder con search_contacts, search_knowledge " +
      "ni tu conocimiento general sobre Kibo Ventures — es decir, cuando de verdad no sepas la respuesta. " +
      "No la uses para preguntas que sí puedas responder. Después de llamarla, responde con naturalidad explicando " +
      "que no tienes esa información pero que el equipo de Kibo puede ayudarle directamente.",
    input_schema: {
      type: "object",
      properties: {
        question: { type: "string", description: "La pregunta original del founder, tal cual la hizo." },
      },
      required: ["question"],
    },
  },
];

// Mismas tools, en el formato de function-calling que espera la API de OpenAI.
export const OPENAI_TOOLS = TOOL_DEFINITIONS.map((t) => ({
  type: "function" as const,
  function: {
    name: t.name,
    description: t.description,
    parameters: t.input_schema,
  },
}));
