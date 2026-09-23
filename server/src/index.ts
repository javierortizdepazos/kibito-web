import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { getSupabaseServerClient } from "./supabase";
import { OPENAI_TOOLS, searchContacts, searchKnowledge, requestIntro } from "./kibitoTools";

const app = express();
const PORT = process.env.PORT || 8080;
const MODEL = "gpt-4o";

// Orígenes permitidos a llamar esta API (el frontend en Vercel + localhost en dev).
// FRONTEND_ORIGIN admite varias URLs separadas por coma.
const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  })
);
app.use(express.json());

const SYSTEM_PROMPT = `Eres Kibito, el asistente de Kibo Ventures para founders del portfolio.

Ayudas a los founders a encontrar contactos (fondos VC, venture debt, financiación
pública, abogados, recruiters, prensa, advisors, restaurantes recomendados, eventos,
perks) y documentos/plantillas reales, y a consultar las guías internas de Kibo.

Reglas importantes:
- Nunca inventes un contacto ni un dato que no venga de una tool. Si no lo
  encuentras, dilo con naturalidad y ofrece pedir una intro si tiene sentido.
- Cuando un founder pida contactar directamente con alguien, usa \`request_intro\`
  en vez de intentar dar tú el contacto — la decisión la toma el equipo de Kibo.
- Sé breve, directo y cercano. Responde en el idioma en que te escriba el founder.`;

async function runTool(sb: any, name: string, input: any) {
  if (name === "search_contacts") return searchContacts(sb, input.table, input.filters || {});
  if (name === "search_knowledge") return searchKnowledge(sb, input.query_text || "");
  if (name === "request_intro") return requestIntro(sb, input);
  return { error: `Tool desconocida: ${name}` };
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/kibito", async (req, res) => {
  try {
    const { message, history } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Falta 'message'." });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ reply: "El backend no tiene configurada OPENAI_API_KEY todavía." });
    }

    const openai = new OpenAI({ apiKey });
    const sb = getSupabaseServerClient();

    let messages: OpenAI.Chat.ChatCompletionMessageParam[] = [...(history || []), { role: "user", content: message }];

    // Bucle de tool-use: seguimos llamando al modelo y ejecutando tools
    // hasta que responda con texto final.
    for (let turn = 0; turn < 6; turn++) {
      const response = await openai.chat.completions.create({
        model: MODEL,
        max_tokens: 1024,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        tools: OPENAI_TOOLS as any,
      });

      const choice = response.choices[0];
      const msg = choice.message;

      if (!msg.tool_calls || msg.tool_calls.length === 0) {
        return res.json({ reply: msg.content || "", history: [...messages, msg] });
      }

      messages = [...messages, msg];
      for (const call of msg.tool_calls) {
        if (call.type !== "function") continue;
        let args: any = {};
        try {
          args = JSON.parse(call.function.arguments || "{}");
        } catch {
          args = {};
        }
        const output = await runTool(sb, call.function.name, args);
        messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(output) });
      }
    }

    return res.json({ reply: "No he podido terminar de responder (demasiadas herramientas encadenadas). Intenta reformular tu pregunta." });
  } catch (err: any) {
    console.error("[/api/kibito] error:", err);
    return res.status(200).json({ reply: `Error del backend: ${err.message || "desconocido"}` });
  }
});

app.post("/api/request-intro", async (req, res) => {
  try {
    const { founder_name, founder_email, startup_name, contact_requested, reason } = req.body || {};
    if (!founder_name || !contact_requested || !reason) {
      return res.status(400).json({ error: "Faltan campos obligatorios." });
    }

    const sb = getSupabaseServerClient();
    const result: any = await requestIntro(sb, { founder_name, founder_email, startup_name, contact_requested, reason });
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }
    return res.json(result);
  } catch (err: any) {
    console.error("[/api/request-intro] error:", err);
    return res.status(500).json({ error: err.message || "Error desconocido" });
  }
});

app.listen(PORT, () => {
  console.log(`Kibito backend escuchando en el puerto ${PORT}`);
});
