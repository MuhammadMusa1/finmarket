import { db } from "@/lib/db";
import { apiError, COMPARABLE } from "@/lib/validation";

export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { return apiError(400, "VALIDATION_ERROR", "Некорректный JSON"); }
  const ids: string[] = body?.product_ids || [];
  if (!Array.isArray(ids) || ids.length < 2 || ids.length > 4)
    return apiError(400, "VALIDATION_ERROR", "Нужно от 2 до 4 продуктов");

  const products = await db.product.findMany({ where: { id: { in: ids }, status: "published" }, include: { category: true } });
  if (products.length < 2) return apiError(400, "VALIDATION_ERROR", "Продукты не найдены");

  const cats = new Set(products.map((p: any) => p.category.code));
  if (cats.size > 1) return apiError(422, "COMPARE_CATEGORY_MISMATCH", "Сравнение возможно только внутри одной категории");

  const code = products[0].category.code;
  const spec = COMPARABLE[code] || [];

  // достаём значение атрибута: прямые поля или из attributesJson
  const valueOf = (p: any, key: string): number | string | null => {
    if (key === "effective_rate") return p.effectiveRate;
    if (key === "amount_max") return p.amountMax;
    if (key === "amount_min") return p.amountMin;
    if (key === "term_max") return p.termMax;
    if (key === "term_min") return p.termMin;
    const attrs = JSON.parse(p.attributesJson) as any[];
    const found = attrs.find((a) => a.key === key);
    if (!found) return null;
    const num = Number(found.value);
    return isNaN(num) ? found.value : num;
  };

  // определяем лучший продукт по каждому числовому атрибуту
  const bestByKey: Record<string, string | null> = {};
  for (const attr of spec) {
    if (attr.best === "none") { bestByKey[attr.key] = null; continue; }
    let bestId: string | null = null; let bestVal: number | null = null;
    for (const p of products as any[]) {
      const v = valueOf(p, attr.key);
      if (typeof v !== "number") continue;
      if (bestVal === null || (attr.best === "lower_is_better" ? v < bestVal : v > bestVal)) {
        bestVal = v; bestId = p.id;
      }
    }
    bestByKey[attr.key] = bestId;
  }

  return Response.json({
    category_code: code,
    attributes: spec,
    products: products.map((p: any) => ({
      product_id: p.id, name: p.name,
      values: Object.fromEntries(spec.map((a) => [a.key, valueOf(p, a.key)])),
      best_in: spec.filter((a) => bestByKey[a.key] === p.id).map((a) => a.key),
    })),
  });
}
