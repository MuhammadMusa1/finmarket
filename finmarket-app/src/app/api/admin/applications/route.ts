import { db } from "@/lib/db";
import { apiError } from "@/lib/validation";
import { requireRole } from "@/lib/auth";
import { getDLQ } from "@/lib/lead-router";

export async function GET(req: Request) {
  const auth = requireRole(req, ["admin", "editor", "viewer"]);
  if (!auth.ok) return apiError(auth.status, auth.code, auth.msg);

  const q = new URL(req.url).searchParams;
  const where: any = {};
  if (q.get("status")) where.status = q.get("status");
  if (q.get("bank")) where.product = { bankId: q.get("bank") };

  const apps = await db.application.findMany({
    where, orderBy: { createdAt: "desc" }, take: 100,
    include: { product: { include: { bank: true } }, deliveries: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  return Response.json({
    dlq_size: getDLQ().length,
    items: apps.map((a: any) => ({
      id: a.id, created_at: a.createdAt, status: a.status,
      product: a.product.name, bank: a.product.bank.name,
      phone_masked: a.phone.replace(/(\+992..)(\d+)(..)/, "$1•••$3"),
      last_delivery: a.deliveries[0] ? { channel: a.deliveries[0].channel, attempt: a.deliveries[0].attemptNo, http: a.deliveries[0].httpStatus } : null,
    })),
  });
}
