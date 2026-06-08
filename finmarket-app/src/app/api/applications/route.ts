import crypto from "crypto";
import { db } from "@/lib/db";
import { apiError, createApplicationSchema, normalizePhone } from "@/lib/validation";
import { enqueueLead } from "@/lib/lead-router";

export async function POST(req: Request) {
  const idemKey = req.headers.get("Idempotency-Key");
  if (!idemKey) return apiError(400, "VALIDATION_ERROR", "Заголовок Idempotency-Key обязателен", { "Idempotency-Key": "required" });

  let raw: any;
  try { raw = await req.json(); } catch { return apiError(400, "VALIDATION_ERROR", "Некорректный JSON"); }

  const parsed = createApplicationSchema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) fields[issue.path.join(".")] = issue.message;
    // отдельный код для согласия (BR-03)
    if (raw?.consent_pdn === false || raw?.consent_pdn === undefined)
      return apiError(400, "CONSENT_REQUIRED", "Согласие на обработку ПДн обязательно", { consent_pdn: "Должно быть true" });
    return apiError(400, "VALIDATION_ERROR", "Ошибка валидации полей", fields);
  }
  const data = parsed.data;
  if (!data.consent_pdn) return apiError(400, "CONSENT_REQUIRED", "Согласие на обработку ПДн обязательно", { consent_pdn: "Должно быть true" });

  const requestHash = crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");

  // Идемпотентность (§18.3)
  const existing = await db.idempotencyKey.findUnique({ where: { key: idemKey } });
  if (existing) {
    if (existing.requestHash !== requestHash)
      return apiError(409, "IDEMPOTENCY_CONFLICT", "Ключ уже использован с другими данными");
    return new Response(existing.responseJson, { status: 201, headers: { "Content-Type": "application/json" } });
  }

  const product = await db.product.findUnique({ where: { id: data.product_id } });
  if (!product || product.status !== "published") return apiError(404, "NOT_FOUND", "Продукт не найден");

  const app = await db.application.create({
    data: {
      productId: data.product_id,
      fullName: data.full_name,
      phone: normalizePhone(data.phone),
      email: data.email ?? null,
      consentPdn: true,
      status: "new",
    },
  });

  const responseBody = JSON.stringify({ id: app.id, status: "new", created_at: app.createdAt.toISOString() });

  await db.idempotencyKey.create({
    data: { key: idemKey, requestHash, responseJson: responseBody, expiresAt: new Date(Date.now() + 24 * 3600 * 1000) },
  });

  // Маршрутизация лида (FR-LR) — асинхронно через in-memory очередь
  enqueueLead(app.id);

  return new Response(responseBody, { status: 201, headers: { "Content-Type": "application/json" } });
}
