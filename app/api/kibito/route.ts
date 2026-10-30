import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { OPENAI_TOOLS, searchContacts, searchKnowledge, requestIntro } from "@/lib/kibitoTools";

export const runtime = "nodejs";

const MODEL = "gpt-5-nano-2025-08-07";
const MAX_MESSAGE_CHARS = 1000;
const MAX_HISTORY_MESSAGES = 20;

const SYSTEM_PROMPT = `Eres Kibito, el asistente de Kibo Ventures para founders del portfolio.

Ayudas a los founders a encontrar contactos (fondos VC, venture debt, financiación
pública, abogados, recruiters, prensa, advisors, restaurantes recomendados, eventos,
perks) y documentos/plantillas reales, y a consultar las guías internas de Kibo
(pitch deck, board meetings, fundraising, reporting, principios de Kibo, VC 101).

Regla de oro: para CUALQUIER dato concreto (un contacto, una cifra, un documento, el
contenido de una guía interna, un precio, una dirección...) llama primero a la tool
que corresponda. Nunca improvises ni "completes" un dato real de memoria — si no
estás seguro de que algo viene de una tool, es que necesitas llamarla. Esto incluye
cosas que parezcan menores (un teléfono, una categoría) tanto como una lista entera.
Solo contesta sin tools cuando sea conocimiento general de negocio/VC que dominas con
certeza (p.ej. "qué es un SAFE", "cómo funciona una liquidation preference").

Qué tool usar:
- \`search_contacts\`: cualquier dato estructurado — contactos (equipo, alumni,
  founders, VCs, venture debt, financiación pública, abogados, recruiters, prensa,
  advisors, restaurantes, eventos, perks) Y también documentos/plantillas/guías
  descargables (table="documents"). Si el founder pregunta "qué guías/documentos
  hay" o pide una plantilla concreta, usa SIEMPRE table="documents" — nunca
  describas de memoria qué documentos existen.
- \`search_knowledge\`: solo para dudas de CONTENIDO abiertas sobre las guías internas
  (p.ej. "cómo explico mi tamaño de mercado", "qué debo incluir en el board deck"),
  no para listar documentos.
- Si buscas y no lo encuentras, dilo con naturalidad (no te lo inventes) y ofrece
  pedir una intro o escalar si tiene sentido.
- \`request_intro\`: cuando el founder quiera contactar directamente con alguien, en
  vez de darle tú el dato — la decisión la toma el equipo de Kibo.
- \`flag_unanswered\`: solo si de verdad no sabes cómo ayudar (no es un tema de
  contactos/recursos de Kibo ni algo que sepas con certeza).

Sé proactivo, no un buscador pasivo: además de responder lo preguntado, anticipa lo
siguiente que le sería útil al founder — ofrece el filtro obvio (presupuesto, sector,
ciudad...), el recurso relacionado (si pregunta por pitch deck, menciona que también
hay plantilla de data room), o el siguiente paso lógico (pedir intro, reservar, ver
otra guía). Una pregunta de seguimiento concreta vale más que una lista larga de
opciones genéricas.

Formato de la respuesta:
- Sé breve, directo y cercano. Responde entero en el idioma del último mensaje del
  founder, sin mezclar idiomas. No menciones nombres de tools ni de tablas.
- Cuando uses \`search_contacts\`, el resultado (contactos o documentos) ya se muestra
  como tarjetas debajo de tu mensaje, con botones de contacto/reserva/descarga. NO
  los repitas uno por uno en el texto: da un resumen de 1-2 frases (p.ej. "aquí
  tienes 5 opciones en Madrid, con distintos presupuestos") y una pregunta de
  seguimiento proactiva, nunca una lista plana con viñetas.`;

// El historial llega del navegador: solo se aceptan mensajes de usuario y respuestas de
// texto del asistente (nada de "system" ni resultados de tools inventados).
function sanitizeHistory(history: unknown): OpenAI.Chat.ChatCompletionMessageParam[] {
  if (!Array.isArray(history)) return [];
  const clean: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  for (const m of history) {
    if (!m || typeof m.content !== "string" || !m.content.trim()) continue;
    if (m.role === "user") clean.push({ role: "user", content: m.content.slice(0, MAX_MESSAGE_CHARS) });
    else if (m.role === "assistant" && !m.tool_calls) clean.push({ role: "assistant", content: m.content });
  }
  return clean.slice(-MAX_HISTORY_MESSAGES);
}

async function runTool(sb: any, name: string, input: any) {
  if (name === "search_contacts") return searchContacts(sb, input.table, input.filters || {}, input.query || "");
  if (name === "search_knowledge") return searchKnowledge(sb, input.query_text || "");
  if (name === "request_intro") return requestIntro(sb, input);
  if (name === "flag_unanswered") return { ok: true };
  return { error: `Tool desconocida: ${name}` };
}

// A partir de la salida de search_contacts (una tabla, o `all_tables`), saca
// grupos {table, items} para que el frontend los pinte como tarjetas.
function extractCardGroups(output: any): { table: string; items: any[] }[] {
  if (!output || output.error) return [];
  if (output.searched === "all_tables" && Array.isArray(output.results)) {
    return output.results
      .filter((r: any) => r?.table && Array.isArray(r.results) && r.results.length)
      .map((r: any) => ({ table: r.table, items: r.results }));
  }
  if (output.table && Array.isArray(output.results) && output.results.length) {
    return [{ table: output.table, items: output.results }];
  }
  return [];
}

export async function POST(req: NextRequest) {
  try {
    const { message, history, context } = await req.json();
    const pageContext = typeof context === "string" ? context.replace(/[\r\n]+/g, " ").trim().slice(0, 200) : "";
    const systemPrompt = pageContext
      ? `${SYSTEM_PROMPT}\n\nContexto: el founder ha abierto el chat desde la sección «${pageContext}» del portal. Úsalo para interpretar preguntas ambiguas y para elegir qué buscar primero.`
      : SYSTEM_PROMPT;
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Falta 'message'." }, { status: 400 });
    }
    if (message.length > MAX_MESSAGE_CHARS) {
      return NextResponse.json({ reply: `El mensaje es demasiado largo (máximo ${MAX_MESSAGE_CHARS} caracteres).` });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ reply: "El backend no tiene configurada OPENAI_API_KEY todavía." }, { status: 200 });
    }

    const openai = new OpenAI({ apiKey });
    const sb = getSupabaseServerClient();

    let messages: OpenAI.Chat.ChatCompletionMessageParam[] = [...sanitizeHistory(history), { role: "user", content: message }];
    let escalatedQuestion: string | null = null;
    let cardGroups: { table: string; items: any[] }[] = [];

    // Bucle de tool-use: seguimos llamando al modelo y ejecutando tools
    // hasta que responda con texto final.
    for (let turn = 0; turn < 6; turn++) {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        tools: OPENAI_TOOLS as any,
        max_completion_tokens: 4000,
        reasoning_effort: "medium",
      });

      const choice = response.choices[0];
      const msg = choice.message;

      if (!msg.tool_calls || msg.tool_calls.length === 0) {
        return NextResponse.json({
          reply: msg.content || "",
          history: [...messages, msg],
          ...(escalatedQuestion ? { escalated: true, question: escalatedQuestion } : {}),
          ...(cardGroups.length ? { cardGroups } : {}),
        });
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
        if (call.function.name === "flag_unanswered" && args.question) {
          escalatedQuestion = args.question;
        }
        const output = await runTool(sb, call.function.name, args);
        if (call.function.name === "search_contacts") {
          cardGroups = extractCardGroups(output);
        }
        messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(output) });
      }
    }

    return NextResponse.json({ reply: "No he podido terminar de responder (demasiadas herramientas encadenadas). Intenta reformular tu pregunta." });
  } catch (err: any) {
    console.error("[/api/kibito] error:", err);
    return NextResponse.json({ reply: `Error del backend: ${err.message || "desconocido"}` }, { status: 200 });
  }
}
