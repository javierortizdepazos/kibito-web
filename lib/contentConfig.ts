// Colecciones que el equipo puede editar desde /admin. El contenido editado se guarda
// en la tabla `site_content`; si una colección tiene `mirror`, además se copia a la
// tabla de Supabase que consulta el chatbot, para que web y chat no se desincronicen.

export type MirrorConfig = {
  table: string;
  cols: string[];
  // Identifica la misma fila entre versiones, para conservar columnas que solo existen
  // en Supabase (p.ej. portfolio_founders.linkedin_url, documents.related_source_page).
  matchKey: (row: any) => string;
};

export type EditableCollection = { key: string; label: string; mirror?: MirrorConfig };

const k = (...fields: string[]) => (row: any) =>
  fields.map((f) => String(row?.[f] ?? "").trim().toLowerCase()).join("|");

export const EDITABLE_COLLECTIONS: EditableCollection[] = [
  { key: "team", label: "Equipo Kibo", mirror: { table: "team", cols: ["name", "position", "email", "twitter", "linkedin_url"], matchKey: k("name") } },
  { key: "alumni", label: "Alumni", mirror: { table: "alumni", cols: ["name", "currently", "linkedin_url"], matchKey: k("name") } },
  {
    key: "portfolio_founders",
    label: "Portfolio founders",
    mirror: { table: "portfolio_founders", cols: ["name", "company", "fund", "linkedin_url", "location", "sector"], matchKey: k("name", "company") },
  },
  { key: "vcs", label: "Fondos VC", mirror: { table: "vcs", cols: ["company", "geo_focus", "hq_country", "sector", "stage_focus"], matchKey: k("company") } },
  { key: "venture_debt", label: "Venture debt", mirror: { table: "venture_debt", cols: ["name", "stage", "min_ticket", "max_ticket"], matchKey: k("name") } },
  {
    key: "public_funding",
    label: "Financiación pública",
    mirror: {
      table: "public_funding",
      cols: ["name", "type", "web", "min_ticket", "max_ticket", "request_period", "sector", "notes"],
      matchKey: k("name"),
    },
  },
  {
    key: "legal_advisors",
    label: "Abogados",
    mirror: { table: "legal_advisors", cols: ["team_lead", "company", "position", "specialization"], matchKey: k("team_lead", "company") },
  },
  {
    key: "recruiters",
    label: "Recruiters",
    mirror: { table: "recruiters", cols: ["name", "company", "type", "position", "email", "contact_visibility"], matchKey: k("name", "company") },
  },
  {
    key: "press_media",
    label: "Prensa",
    mirror: { table: "press_media", cols: ["company", "type", "contact_name", "position"], matchKey: k("company", "contact_name") },
  },
  { key: "advisors", label: "Advisors", mirror: { table: "advisors", cols: ["name", "type", "company", "contact"], matchKey: k("name", "company") } },
  {
    key: "restaurants",
    label: "Restaurantes",
    mirror: {
      table: "restaurants",
      cols: ["name", "city", "address", "phone", "email", "price_range", "cuisine", "formality", "book_url", "recommendation"],
      matchKey: k("name", "city"),
    },
  },
  { key: "events", label: "Eventos organizados", mirror: { table: "events", cols: ["name", "location", "event_date"], matchKey: k("name", "event_date") } },
  { key: "perks", label: "Perks", mirror: { table: "perks", cols: ["name", "url", "description", "notes"], matchKey: k("name") } },
  {
    key: "documents",
    label: "Documentos",
    mirror: { table: "documents", cols: ["title", "category", "file_url", "related_source_page"], matchKey: k("title") },
  },
  { key: "ai_repository", label: "AI Repository" },
  { key: "top_recommendations", label: "Recomendaciones" },
  { key: "vc101.sessions", label: "VC 101 · Sesiones" },
  { key: "vc101.caselettes", label: "VC 101 · Caselettes" },
  { key: "vc101.readings", label: "VC 101 · Lecturas" },
];

export function findCollection(key: string) {
  return EDITABLE_COLLECTIONS.find((c) => c.key === key);
}
