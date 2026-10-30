// Sin cuentas por founder, cada navegador recuerda los tokens de las intros que pidió
// para poder consultar su estado en "Mis solicitudes".
const KEY = "kibo_my_intros";

export type MyIntro = { token: string; contact: string; created: string };

export function getMyIntros(): MyIntro[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v.filter((x) => x && typeof x.token === "string") : [];
  } catch {
    return [];
  }
}

export function rememberIntro(request: any) {
  if (!request?.public_token) return;
  try {
    const entry: MyIntro = {
      token: request.public_token,
      contact: String(request.contact_requested || ""),
      created: request.created_at || new Date().toISOString(),
    };
    const list = [entry, ...getMyIntros().filter((x) => x.token !== entry.token)].slice(0, 50);
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // sin localStorage (modo privado): la intro se envía igual, solo no se puede seguir
  }
}
