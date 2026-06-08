import { db } from "@/lib/db";
import { apiError } from "@/lib/validation";
import { requireRole } from "@/lib/auth";

export async function GET(req: Request) {
  const auth = requireRole(req, ["admin", "editor", "viewer"]);
  if (!auth.ok) return apiError(auth.status, auth.code, auth.msg);
  const logs = await db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return Response.json(logs.map((l: any) => ({ ...l, diff: JSON.parse(l.diffJson) })));
}
