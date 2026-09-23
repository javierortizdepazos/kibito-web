import { createClient } from "@supabase/supabase-js";

// Solo se usa en el servidor — la service_role key nunca debe llegar al navegador.
export function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno.");
  }
  return createClient(url, key);
}
