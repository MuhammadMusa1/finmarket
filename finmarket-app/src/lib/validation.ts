import { z } from "zod";

// Формат телефона РТ (BR-08, §18.1 ТЗ)
export const TJ_PHONE = /^\+992(37|44|55|77|88|90|91|92|93|98)\d{7}$/;

export function normalizePhone(raw: string): string {
  return raw.replace(/[\s\-()]/g, "");
}

export const createApplicationSchema = z.object({
  product_id: z.string().uuid(),
  full_name: z.string().min(2).max(120),
  phone: z.string().refine((v) => TJ_PHONE.test(normalizePhone(v)), {
    message: "Формат: +992XXYYYYYYY",
  }),
  email: z.string().email().nullable().optional(),
  consent_pdn: z.boolean(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;

// Стандарт ошибок API (§18.2 ТЗ)
export function apiError(
  status: number,
  code: string,
  message: string,
  fields?: Record<string, string>
) {
  return Response.json(
    { error: { code, message, fields, trace_id: "req_" + Math.random().toString(36).slice(2, 8) } },
    { status }
  );
}

// Сравниваемые атрибуты по категориям (§18.7 ТЗ, comparable-attributes.json)
export const COMPARABLE: Record<string, { key: string; label_ru: string; unit: string; best: "lower_is_better" | "higher_is_better" | "none" }[]> = {
  credit: [
    { key: "effective_rate", label_ru: "Эффективная ставка", unit: "%", best: "lower_is_better" },
    { key: "amount_max", label_ru: "Макс. сумма", unit: "currency", best: "higher_is_better" },
    { key: "term_max", label_ru: "Макс. срок", unit: "мес", best: "higher_is_better" },
    { key: "fee_origination", label_ru: "Комиссия оформления", unit: "%", best: "lower_is_better" },
  ],
  deposit: [
    { key: "effective_rate", label_ru: "Доходность", unit: "%", best: "higher_is_better" },
    { key: "term_min", label_ru: "Мин. срок", unit: "мес", best: "lower_is_better" },
    { key: "amount_min", label_ru: "Мин. сумма", unit: "currency", best: "lower_is_better" },
    { key: "capitalization", label_ru: "Капитализация", unit: "text", best: "none" },
  ],
  debit_card: [
    { key: "card_annual", label_ru: "Обслуживание/год", unit: "currency", best: "lower_is_better" },
    { key: "cashback_percent", label_ru: "Кэшбэк", unit: "%", best: "higher_is_better" },
  ],
  credit_card: [
    { key: "effective_rate", label_ru: "Ставка", unit: "%", best: "lower_is_better" },
    { key: "grace_period_days", label_ru: "Льготный период", unit: "дней", best: "higher_is_better" },
    { key: "credit_limit_max", label_ru: "Лимит", unit: "currency", best: "higher_is_better" },
  ],
  mortgage: [
    { key: "effective_rate", label_ru: "Эффективная ставка", unit: "%", best: "lower_is_better" },
    { key: "down_payment_min", label_ru: "Первый взнос от", unit: "%", best: "lower_is_better" },
    { key: "term_max", label_ru: "Срок до", unit: "мес", best: "higher_is_better" },
  ],
  microloan: [
    { key: "effective_rate", label_ru: "Ставка", unit: "%", best: "lower_is_better" },
    { key: "amount_max", label_ru: "Сумма до", unit: "currency", best: "higher_is_better" },
    { key: "approval_time", label_ru: "Время одобрения", unit: "text", best: "none" },
  ],
  rko: [
    { key: "monthly_service", label_ru: "Обслуживание/мес", unit: "currency", best: "lower_is_better" },
    { key: "free_payments", label_ru: "Бесплатных платежей", unit: "число", best: "higher_is_better" },
  ],
  insurance: [
    { key: "premium_from", label_ru: "Стоимость от", unit: "currency", best: "lower_is_better" },
    { key: "coverage_max", label_ru: "Покрытие до", unit: "currency", best: "higher_is_better" },
  ],
};
