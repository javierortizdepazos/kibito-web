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
  restaurants: { textCols: ["name", "city", "cuisine", "formality", "price_range", "recommendation"] },
  events: { textCols: ["name", "location"] },
  perks: { textCols: ["name", "description"] },
  documents: { textCols: ["title", "category", "related_source_page"] },
};

// Minúsculas y sin tildes, para que "Maria" encuentre "María".
function normalize(v: unknown): string {
  return String(v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Todas las palabras de `needle` tienen que aparecer en `haystack`.
function matchesAllWords(haystack: string, needle: string): boolean {
  const words = normalize(needle).split(/\s+/).filter(Boolean);
  return words.every((w) => haystack.includes(w));
}

export async function searchContacts(
  sb: SupabaseClient,
  table: string,
  filters: Record<string, string> = {},
  query = "",
  limit = 25
) {
  const cfg = SEARCHABLE_TABLES[table];
  if (!cfg) return { error: `Tabla no permitida: ${table}` };

  // Las tablas son pequeñas (cientos de filas): las traemos enteras y filtramos aquí,
  // sin distinguir tildes ni mayúsculas.
  const { data, error } = await sb.from(table).select("*").limit(1000);
  if (error) return { error: error.message };

  let rows: any[] = data || [];
  const columns = new Set(rows.length ? Object.keys(rows[0]) : []);
  const rowText = (r: any) => normalize(Object.values(r).join(" "));

  // Un filtro sobre una columna que no existe no rompe la búsqueda: su valor se busca en toda la fila.
  const keywords: string[] = query ? [query] : [];
  for (const [col, value] of Object.entries(filters || {})) {
    if (value === undefined || value === null || value === "") continue;
    if (columns.has(col)) {
      rows = rows.filter((r) => matchesAllWords(normalize(r[col]), String(value)));
    } else {
      keywords.push(String(value));
    }
  }
  for (const kw of keywords) {
    rows = rows.filter((r) => matchesAllWords(rowText(r), kw));
  }

  const total = rows.length;
  rows = rows.slice(0, limit);
  if (table === "recruiters") {
    rows = rows.map((r: any) => (r.contact_visibility === "request_only" ? { ...r, email: null, _note: "Contacto disponible solo bajo petición de intro." } : r));
  }
  return { table, count: total, results: rows };
}

export async function searchKnowledge(sb: SupabaseClient, queryText: string, limit = 5) {
  // Fallback de texto mientras no haya embeddings cargados en knowledge_chunks:
  // puntúa cada chunk por cuántas palabras de la pregunta contiene.
  const { data, error } = await sb.from("knowledge_chunks").select("id, source_page, section, content");
  if (error) return { error: error.message };
  const words = normalize(queryText)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3);
  const scored = (data || [])
    .map((c: any) => {
      const text = normalize(`${c.source_page} ${c.section} ${c.content}`);
      return { chunk: c, score: words.filter((w) => text.includes(w)).length };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.chunk);
  return { mode: "text_fallback", results: scored };
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
      "documentos/plantillas. La búsqueda ignora tildes y mayúsculas. Columnas útiles por tabla: " +
      Object.entries(SEARCHABLE_TABLES)
        .map(([t, c]) => `${t}(${c.textCols.join(", ")})`)
        .join("; ") +
      ". Restaurantes: formality vale 'Formal', 'Business Casual' o 'Casual'. " +
      "Para personas, busca por apellido si no encuentras el nombre completo. Si no hay resultados, prueba con " +
      "menos filtros o con `query` antes de decir que no existe.",
    input_schema: {
      type: "object",
      properties: {
        table: { type: "string", enum: Object.keys(SEARCHABLE_TABLES), description: "Qué tabla consultar." },
        filters: {
          type: "object",
          description: "Pares columna->valor a filtrar (coincidencia parcial). Usa solo columnas de la tabla elegida.",
        },
        query: { type: "string", description: "Palabras clave a buscar en cualquier columna de la tabla." },
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
