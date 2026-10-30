// Cookies de sesión firmadas con HMAC: la cookie nunca contiene la contraseña, y al
// cambiar la contraseña en Vercel todas las sesiones antiguas dejan de valer.
// Usa Web Crypto para funcionar igual en el middleware (edge) y en las API routes.

export const SITE_COOKIE = "kibito_pw";
export const ADMIN_COOKIE = "kibito_admin";
export const SITE_PURPOSE = "kibito-site-v1";
export const ADMIN_PURPOSE = "kibito-admin-v1";

const enc = new TextEncoder();

export async function signToken(secret: string, purpose: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(purpose));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function isValidSession(cookieValue: string | undefined, secret: string | undefined, purpose: string) {
  if (!cookieValue || !secret) return false;
  return safeEqual(cookieValue, await signToken(secret, purpose));
}
