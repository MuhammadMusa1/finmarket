import { db } from "@/lib/db";
import { apiError } from "@/lib/validation";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const p = await db.product.findUnique({ where: { id: params.id }, include: { bank: true, category: true } });
  if (!p || p.status !== "published") return apiError(404, "NOT_FOUND", "Продукт не найден");

  return Response.json({
    id: p.id, name: p.name, category_code: p.category.code, currency: p.currency,
    rate_min: p.rateMin, rate_max: p.rateMax, effective_rate: p.effectiveRate,
    amount_min: p.amountMin, amount_max: p.amountMax, term_min: p.termMin, term_max: p.termMax,
    status: p.status, updated_at: p.updatedAt,
    fees: JSON.parse(p.feesJson), requirements: JSON.parse(p.requirementsJson),
    attributes: JSON.parse(p.attributesJson),
    bank: { id: p.bank.id, name: p.bank.name, logoText: p.bank.logoText, verified: p.bank.verified, license_no: p.bank.licenseNo },
  });
}
