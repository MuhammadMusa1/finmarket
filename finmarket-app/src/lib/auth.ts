import { db } from "@/lib/db";

// Демо-аутентификация: токен = base64(email:role). В проде — JWT/Keycloak (OIDC).
export function makeToken(email: string, role: string) {
  return Buffer.from(`${email}:${role}`).toString("base64");
}

export function parseToken(req: Request): { email: string; role: string } | null {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    const [email, role] = Buffer.from(auth.slice(7), "base64").toString().split(":");
    if (!email || !role) return null;
    return { email, role };
  } catch { return null; }
}

// RBAC: проверка, что роль входит в список разрешённых
export function requireRole(req: Request, roles: string[]) {
  const user = parseToken(req);
  if (!user) return { ok: false as const, status: 401, code: "UNAUTHORIZED", msg: "Требуется авторизация" };
  if (!roles.includes(user.role)) return { ok: false as const, status: 403, code: "FORBIDDEN", msg: "Недостаточно прав" };
  return { ok: true as const, user };
}

export async function writeAudit(actorEmail: string, entityType: string, entityId: string, action: string, diff: any) {
  await db.auditLog.create({ data: { actorEmail, entityType, entityId, action, diffJson: JSON.stringify(diff) } });
}
