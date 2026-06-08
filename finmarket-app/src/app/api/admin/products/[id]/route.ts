import { db } from "@/lib/db";
import { apiError } from "@/lib/validation";
import { requireRole, writeAudit } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const auth = requireRole(req, ["admin", "editor"]);
  if (!auth.ok) return apiError(auth.status, auth.code, auth.msg);

  const before = await db.product.findUnique({ where: { id: params.id } });
  if (!before) return apiError(404, "NOT_FOUND", "Продукт не найден");

  const b = await req.json().catch(() => ({}));
  const updated = await db.product.update({
    where: { id: params.id },
    data: {
      name: b.name ?? before.name,
      effectiveRate: b.effective_rate ?? before.effectiveRate,
      rateMin: b.rate_min ?? before.rateMin,
      rateMax: b.rate_max ?? before.rateMax,
      status: b.status ?? before.status,
      publishedAt: b.status === "published" && !before.publishedAt ? new Date() : before.publishedAt,
    },
  });

  // diff для AuditLog (BR-07)
  const diff: any = {};
  for (const k of ["name", "effectiveRate", "rateMin", "rateMax", "status"] as const) {
    if ((before as any)[k] !== (updated as any)[k]) diff[k] = { from: (before as any)[k], to: (updated as any)[k] };
  }
  await writeAudit(auth.user.email, "Product", updated.id, b.status && b.status !== before.status ? "publish" : "update", diff);
  return Response.json({ id: updated.id, status: updated.status });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const auth = requireRole(req, ["admin"]); // только admin
  if (!auth.ok) return apiError(auth.status, auth.code, auth.msg);
  const p = await db.product.findUnique({ where: { id: params.id } });
  if (!p) return apiError(404, "NOT_FOUND", "Продукт не найден");
  await db.application.deleteMany({ where: { productId: p.id } });
  await db.product.delete({ where: { id: p.id } });
  await writeAudit(auth.user.email, "Product", p.id, "delete", { name: p.name });
  return new Response(null, { status: 204 });
}
