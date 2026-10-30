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

Cómo trabajar:
- Antes de responder con datos concretos (contactos, cifras, plantillas), usa
  \`search_contacts\` o \`search_knowledge\` — no respondas de memoria sobre el
  portfolio o los recursos internos de Kibo, esos SIEMPRE vienen de las tools.
- Puedes responder directamente, sin tools, preguntas generales de conocimiento de
  negocio/VC (p.ej. "qué es un SAFE", "cómo funciona una liquidation preference")
  si estás seguro de la respuesta.
- Nunca inventes un contacto ni un dato que debería venir de una tool. Si buscas y
  no lo encuentras, dilo con naturalidad y ofrece pedir una intro si tiene sentido.
- Cuando un founder pida contactar directamente con alguien, usa \`request_intro\`
  en vez de dar tú el contacto — la decisión la toma el equipo de Kibo.
- Si de verdad no sabes cómo ayudar con algo (no es un tema de contactos/recursos
  de Kibo ni algo que sepas con seguridad), usa \`flag_unanswered\` con la pregunta
  del founder, y responde con naturalidad que no tienes esa información pero que
  el equipo de Kibo puede ayudarle directamente.
- Sé breve, directo y cercano. Responde entero en el idioma del último mensaje del
  founder, sin mezclar idiomas. No menciones nombres de tools ni de tablas.
- Cuando uses \`search_contacts\`, el resultado ya se muestra como tarjetas debajo de
  tu mensaje (nombre, datos y botones de contacto/reserva). NO los repitas uno por
  uno en el texto: da solo un resumen de 1-2 frases (p.ej. "aquí tienes 5 opciones
  en Madrid, con distintos presupuestos") y, si aplica, una pregunta de seguimiento.`;

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
    const { message, history } = await req.json();
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
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        tools: OPENAI_TOOLS as any,
        max_completion_tokens: 4000,
        reasoning_effort: "low",
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
