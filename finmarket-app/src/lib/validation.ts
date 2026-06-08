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
export const COMPARABLE: Record<string, { key: string; label_ru: string; label_tj: string; unit: string; best: "lower_is_better" | "higher_is_better" | "none" }[]> = {
  credit: [
    { key: "effective_rate", label_ru: "Эффективная ставка", label_tj: "Меъёри муассир", unit: "%", best: "lower_is_better" },
    { key: "amount_max", label_ru: "Макс. сумма", label_tj: "Ҳадди аксари маблағ", unit: "currency", best: "higher_is_better" },
    { key: "term_max", label_ru: "Макс. срок", label_tj: "Ҳадди аксари мӯҳлат", unit: "мес", best: "higher_is_better" },
    { key: "fee_origination", label_ru: "Комиссия оформления", label_tj: "Комиссияи расмият даровардан", unit: "%", best: "lower_is_better" },
  ],
  deposit: [
    { key: "effective_rate", label_ru: "Доходность", label_tj: "Даромаднокӣ", unit: "%", best: "higher_is_better" },
    { key: "term_min", label_ru: "Мин. срок", label_tj: "Ҳадди ақали мӯҳлат", unit: "мес", best: "lower_is_better" },
    { key: "amount_min", label_ru: "Мин. сумма", label_tj: "Ҳадди ақали маблағ", unit: "currency", best: "lower_is_better" },
    { key: "capitalization", label_ru: "Капитализация", label_tj: "Капитализатсия", unit: "text", best: "none" },
  ],
  debit_card: [
    { key: "card_annual", label_ru: "Обслуживание/год", label_tj: "Хизматрасонӣ/сол", unit: "currency", best: "lower_is_better" },
    { key: "cashback_percent", label_ru: "Кэшбэк", label_tj: "Кэшбэк", unit: "%", best: "higher_is_better" },
  ],
  credit_card: [
    { key: "effective_rate", label_ru: "Ставка", label_tj: "Меъёр", unit: "%", best: "lower_is_better" },
    { key: "grace_period_days", label_ru: "Льготный период", label_tj: "Давраи имтиёзӣ", unit: "дней", best: "higher_is_better" },
    { key: "credit_limit_max", label_ru: "Лимит", label_tj: "Лимит", unit: "currency", best: "higher_is_better" },
  ],
  mortgage: [
    { key: "effective_rate", label_ru: "Эффективная ставка", label_tj: "Меъёри муассир", unit: "%", best: "lower_is_better" },
    { key: "down_payment_min", label_ru: "Первый взнос от", label_tj: "Пардохти аввалин аз", unit: "%", best: "lower_is_better" },
    { key: "term_max", label_ru: "Срок до", label_tj: "Мӯҳлат то", unit: "мес", best: "higher_is_better" },
  ],
  microloan: [
    { key: "effective_rate", label_ru: "Ставка", label_tj: "Меъёр", unit: "%", best: "lower_is_better" },
    { key: "amount_max", label_ru: "Сумма до", label_tj: "Маблағ то", unit: "currency", best: "higher_is_better" },
    { key: "approval_time", label_ru: "Время одобрения", label_tj: "Вақти тасдиқ", unit: "text", best: "none" },
  ],
  rko: [
    { key: "monthly_service", label_ru: "Обслуживание/мес", label_tj: "Хизматрасонӣ/моҳ", unit: "currency", best: "lower_is_better" },
    { key: "free_payments", label_ru: "Бесплатных платежей", label_tj: "Пардохтҳои ройгон", unit: "число", best: "higher_is_better" },
  ],
  insurance: [
    { key: "premium_from", label_ru: "Стоимость от", label_tj: "Арзиш аз", unit: "currency", best: "lower_is_better" },
    { key: "coverage_max", label_ru: "Покрытие до", label_tj: "Рӯйпӯшкунӣ то", unit: "currency", best: "higher_is_better" },
  ],
};
