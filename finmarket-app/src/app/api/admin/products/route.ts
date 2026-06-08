import { db } from "@/lib/db";
import { apiError } from "@/lib/validation";
import { requireRole, writeAudit } from "@/lib/auth";

export async function GET(req: Request) {
  const auth = requireRole(req, ["admin", "editor", "viewer"]);
  if (!auth.ok) return apiError(auth.status, auth.code, auth.msg);
  const products = await db.product.findMany({ orderBy: { updatedAt: "desc" }, include: { bank: true, category: true } });
  return Response.json(products.map((p: any) => ({
    id: p.id, name: p.name, bank: p.bank.name, category: p.category.code,
    effective_rate: p.effectiveRate, status: p.status,
  })));
}

export async function POST(req: Request) {
  const auth = requireRole(req, ["admin", "editor"]);
  if (!auth.ok) return apiError(auth.status, auth.code, auth.msg);
  const b = await req.json().catch(() => ({}));
  if (!b.bank_id || !b.category_id || !b.name) return apiError(400, "VALIDATION_ERROR", "bank_id, category_id, name обязательны");
  const p = await db.product.create({
    data: {
      bankId: b.bank_id, categoryId: b.category_id, name: b.name, currency: b.currency || "TJS",
      rateMin: b.rate_min, rateMax: b.rate_max, effectiveRate: b.effective_rate,
      amountMin: b.amount_min, amountMax: b.amount_max, termMin: b.term_min, termMax: b.term_max,
      status: b.status || "draft", publishedAt: b.status === "published" ? new Date() : null,
    },
  });
  await writeAudit(auth.user.email, "Product", p.id, "create", { name: p.name });
  return new Response(JSON.stringify({ id: p.id }), { status: 201, headers: { "Content-Type": "application/json" } });
}
