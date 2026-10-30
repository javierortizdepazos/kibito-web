export async function notifySlackIntroRequest(request: {
  id?: number | string;
  founder_name: string;
  startup_name?: string | null;
  contact_requested: string;
  reason: string;
}) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log("[notify] SLACK_WEBHOOK_URL no configurada, no se avisa a Slack.");
    return;
  }
  const text =
    `*Nueva solicitud de intro*\n` +
    `*Founder:* ${request.founder_name} (${request.startup_name || "startup no indicada"})\n` +
    `*Contacto pedido:* ${request.contact_requested}\n` +
    `*Motivo:* ${request.reason}\n` +
    `*Estado:* pendiente (id ${request.id})`;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (e) {
    console.error("[notify] Error avisando a Slack:", e);
  }
}
