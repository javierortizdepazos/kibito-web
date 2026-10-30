import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, ADMIN_PURPOSE, isValidSession } from "./authToken";

export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export async function isAdmin(req: NextRequest) {
  return isValidSession(req.cookies.get(ADMIN_COOKIE)?.value, process.env.ADMIN_PASSWORD, ADMIN_PURPOSE);
}
