import { db } from "@/lib/db";
import { apiError } from "@/lib/validation";
import { requireRole } from "@/lib/auth";
import { enqueueLead } from "@/lib/lead-router";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const auth = requireRole(req, ["admin", "editor"]);
  if (!auth.ok) return apiError(auth.status, auth.code, auth.msg);
  const app = await db.application.findUnique({ where: { id: params.id } });
  if (!app) return apiError(404, "NOT_FOUND", "Заявка не найдена");
  await db.application.update({ where: { id: app.id }, data: { status: "new" } });
  enqueueLead(app.id);
  return new Response(JSON.stringify({ status: "queued" }), { status: 202, headers: { "Content-Type": "application/json" } });
}
