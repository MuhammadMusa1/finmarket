import { db } from "@/lib/db";
import { apiError } from "@/lib/validation";
import { makeToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  const user = await db.adminUser.findUnique({ where: { email } });
  if (!user || user.password !== password) return apiError(401, "UNAUTHORIZED", "Неверный логин или пароль");
  return Response.json({ access_token: makeToken(user.email, user.role), role: user.role, email: user.email });
}
