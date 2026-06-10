import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

/* ============================================================
   Seed v2 — реальные данные рынка РТ (июнь 2026)
   Источник: «Анализ банковских продуктов Таджикистана (2026)»
   Ставки/суммы/сроки — из документа; webhook-URL демо.
   ============================================================ */

const CATS = [
  { code: "credit", nameTj: "Қарзҳо", nameRu: "Кредиты", sortOrder: 1 },
  { code: "deposit", nameTj: "Пасандозҳо", nameRu: "Депозиты", sortOrder: 2 },
  { code: "debit_card", nameTj: "Кортҳои дебетӣ", nameRu: "Дебетовые карты", sortOrder: 3 },
  { code: "credit_card", nameTj: "Кортҳои қарзӣ", nameRu: "Кредитные карты", sortOrder: 4 },
  { code: "mortgage", nameTj: "Ипотека", nameRu: "Ипотека", sortOrder: 5 },
  { code: "microloan", nameTj: "Микроқарзҳо", nameRu: "Микрозаймы", sortOrder: 6 },
  { code: "rko", nameTj: "Хизматрасонии тиҷоратӣ", nameRu: "РКО для бизнеса", sortOrder: 7 },
  { code: "insurance", nameTj: "Суғурта", nameRu: "Страхование", sortOrder: 8 },
];

/* 10 реальных банков/МФО из анализа. Лицензии — демо-номера. */
const BANKS = [
  { key: "eskhata",   name: "Банк Эсхата",        logoText: "ЭС", licenseNo: "0012", rating: 4.8, isPartner: true, priority: 100, webhookUrl: "https://webhook.site/demo-eskhata", routingEmail: "leads@eskhata.tj" },
  { key: "alif",      name: "Алиф Банк",           logoText: "АЛ", licenseNo: "0044", rating: 4.7, isPartner: true, priority: 95,  webhookUrl: "https://webhook.site/demo-alif",    routingEmail: "leads@alif.tj" },
  { key: "amonat",    name: "Амонатбанк",          logoText: "АМ", licenseNo: "0001", rating: 4.5, isPartner: true, priority: 90,  webhookUrl: null,                                 routingEmail: "leads@amonatbonk.tj" },
  { key: "oriyon",    name: "Ориёнбанк",           logoText: "ОР", licenseNo: "0003", rating: 4.4, isPartner: false, priority: 80, webhookUrl: null,                                 routingEmail: "leads@oriyonbonk.tj" },
  { key: "spitamen",  name: "Спитамен Банк",       logoText: "СП", licenseNo: "0024", rating: 4.6, isPartner: true, priority: 85,  webhookUrl: "https://webhook.site/demo-spitamen", routingEmail: "leads@spitamenbank.tj" },
  { key: "humo",      name: "Хумо Банк",           logoText: "ХМ", licenseNo: "0052", rating: 4.5, isPartner: true, priority: 75,  webhookUrl: "https://webhook.site/demo-humo",     routingEmail: "leads@humo.tj" },
  { key: "ibt",       name: "МБТ (IBT)",           logoText: "МБ", licenseNo: "0017", rating: 4.4, isPartner: false, priority: 70, webhookUrl: null,                                 routingEmail: "leads@ibt.tj" },
  { key: "arvand",    name: "Банк Арванд",         logoText: "АР", licenseNo: "0029", rating: 4.2, isPartner: false, priority: 60, webhookUrl: null,                                 routingEmail: "leads@arvand.tj" },
  { key: "dc",        name: "Душанбе Сити Банк",   logoText: "ДС", licenseNo: "0053", rating: 4.6, isPartner: true, priority: 78,  webhookUrl: "https://webhook.site/demo-dc",       routingEmail: "leads@dc.tj" },
  { key: "tawhid",    name: "Тавхидбанк",          logoText: "ТВ", licenseNo: "0061", rating: 4.3, isPartner: false, priority: 55, webhookUrl: null,                                 routingEmail: "leads@tawhidbank.tj" },
];

/* Курсы валют (НБТ, апрель–июнь 2026, из анализа).
   USD = 9,3537 — официальный курс НБТ из документа.
   EUR/RUB — допущение (в документе нет), редактируются в админке/БД. */
const RATES = [
  { code: "USD", nameRu: "Доллар США", nameTj: "Доллари ИМА", nbt: 9.3537, buy: 9.30, sell: 9.42 },
  { code: "EUR", nameRu: "Евро",        nameTj: "Евро",        nbt: 10.72,  buy: 10.62, sell: 10.85 }, // допущение
  { code: "RUB", nameRu: "Рос. рубль",  nameTj: "Рубли русӣ",  nbt: 0.1185, buy: 0.115, sell: 0.122 }, // допущение
];

const fees = (items: any[]) => JSON.stringify({ items });
const reqs = (o: any) => JSON.stringify(o);
const attrs = (a: any[]) => JSON.stringify(a);
const feeOrig = (v: number) => fees([{ code: "origination", label_ru: "За оформление", label_tj: "Кушодан", type: "percent", value_percent: v }]);

function buildProducts(B: Record<string, string>, C: Record<string, string>) {
  const P: any[] = [];
  const pub = (extra: any) => ({ status: "published", publishedAt: new Date(), ...extra });

  /* ---------- КРЕДИТЫ (ставки из таблицы №1 анализа) ---------- */
  P.push(pub({ bankId: B.amonat, categoryId: C.credit, name: "Потребительский кредит", currency: "TJS",
    rateMin: 16, rateMax: 21, effectiveRate: 16.0, amountMin: 3000, amountMax: 120000, termMin: 6, termMax: 60,
    feesJson: feeOrig(1.0), requirementsJson: reqs({ age_min: 21, age_max: 65, citizenship: ["TJ"], income_proof_required: true }),
    attributesJson: attrs([{ key: "fee_origination", value: "1.0", isComparable: true }]) }));
  P.push(pub({ bankId: B.oriyon, categoryId: C.credit, name: "Потребительский кредит", currency: "TJS",
    rateMin: 17.5, rateMax: 22, effectiveRate: 17.5, amountMin: 5000, amountMax: 150000, termMin: 6, termMax: 48,
    feesJson: feeOrig(1.5), attributesJson: attrs([{ key: "fee_origination", value: "1.5", isComparable: true }]) }));
  P.push(pub({ bankId: B.eskhata, categoryId: C.credit, name: "Многоцелевой кредит", currency: "TJS",
    rateMin: 29, rateMax: 32, effectiveRate: 29.0, amountMin: 3000, amountMax: 100000, termMin: 6, termMax: 36,
    feesJson: feeOrig(1.5), attributesJson: attrs([{ key: "fee_origination", value: "1.5", isComparable: true }]) }));
  P.push(pub({ bankId: B.eskhata, categoryId: C.credit, name: "Кредит Online (без визита)", currency: "TJS",
    rateMin: 30, rateMax: 30, effectiveRate: 30.0, amountMin: 500, amountMax: 10000, termMin: 3, termMax: 24,
    requirementsJson: reqs({ age_min: 18, citizenship: ["TJ"], online_only: true }),
    attributesJson: attrs([{ key: "approval_time", value: "В приложении", isComparable: false }]) }));
  P.push(pub({ bankId: B.spitamen, categoryId: C.credit, name: "Потребительский кредит", currency: "TJS",
    rateMin: 25, rateMax: 28, effectiveRate: 25.0, amountMin: 5000, amountMax: 100000, termMin: 6, termMax: 36,
    feesJson: feeOrig(2.0), attributesJson: attrs([{ key: "fee_origination", value: "2.0", isComparable: true }]) }));
  P.push(pub({ bankId: B.spitamen, categoryId: C.credit, name: "Автокредит", currency: "TJS",
    rateMin: 14, rateMax: 18, effectiveRate: 14.0, amountMin: 20000, amountMax: 400000, termMin: 12, termMax: 48,
    attributesJson: attrs([{ key: "fee_origination", value: "1.0", isComparable: true }]) }));
  P.push(pub({ bankId: B.ibt, categoryId: C.credit, name: "Бизнес-кредит", currency: "TJS",
    rateMin: 19, rateMax: 24, effectiveRate: 19.0, amountMin: 50000, amountMax: 10000000, termMin: 12, termMax: 48,
    feesJson: feeOrig(1.0), attributesJson: attrs([{ key: "fee_origination", value: "1.0", isComparable: true }]) }));
  P.push(pub({ bankId: B.dc, categoryId: C.credit, name: "Потребительский кредит", currency: "TJS",
    rateMin: 26, rateMax: 30, effectiveRate: 26.0, amountMin: 1000, amountMax: 100000, termMin: 6, termMax: 60,
    attributesJson: attrs([{ key: "fee_origination", value: "1.5", isComparable: true }]) }));
  P.push(pub({ bankId: B.dc, categoryId: C.credit, name: "Автокредит", currency: "TJS",
    rateMin: 20, rateMax: 24, effectiveRate: 20.0, amountMin: 10000, amountMax: 500000, termMin: 12, termMax: 60,
    attributesJson: attrs([{ key: "fee_origination", value: "1.0", isComparable: true }]) }));
  P.push(pub({ bankId: B.alif, categoryId: C.credit, name: "Лизинг для бизнеса", currency: "TJS",
    rateMin: 28, rateMax: 28, effectiveRate: 28.0, amountMin: 10000, amountMax: 1000000, termMin: 6, termMax: 36,
    requirementsJson: reqs({ prepayment_min_percent: 20 }),
    attributesJson: attrs([{ key: "fee_origination", value: "0", isComparable: true }]) }));

  /* ---------- ДЕПОЗИТЫ (таблица №2) ---------- */
  P.push(pub({ bankId: B.eskhata, categoryId: C.deposit, name: "Срочный депозит", currency: "TJS",
    effectiveRate: 15.0, amountMin: 100, amountMax: 10000000, termMin: 6, termMax: 24,
    attributesJson: attrs([{ key: "capitalization", value: "Да", isComparable: true }]) }));
  P.push(pub({ bankId: B.alif, categoryId: C.deposit, name: "Депозит «Мухлатнок»", currency: "TJS",
    effectiveRate: 15.0, amountMin: 1, amountMax: 5000000, termMin: 12, termMax: 12,
    attributesJson: attrs([{ key: "capitalization", value: "Да", isComparable: true }]) }));
  P.push(pub({ bankId: B.alif, categoryId: C.deposit, name: "Депозит «Дилхох вакт»", currency: "TJS",
    effectiveRate: 13.0, amountMin: 1, amountMax: 5000000, termMin: 12, termMax: 60,
    attributesJson: attrs([{ key: "capitalization", value: "Да", isComparable: true }]) }));
  P.push(pub({ bankId: B.humo, categoryId: C.deposit, name: "Несгораемый «Сарчашма»", currency: "TJS",
    effectiveRate: 15.5, amountMin: 10, amountMax: 5000000, termMin: 24, termMax: 24,
    attributesJson: attrs([{ key: "capitalization", value: "Да", isComparable: true }, { key: "early_withdrawal", value: "Без потери %", isComparable: true }]) }));
  P.push(pub({ bankId: B.humo, categoryId: C.deposit, name: "Депозит «Кафолат»", currency: "TJS",
    effectiveRate: 16.0, amountMin: 100, amountMax: 5000000, termMin: 12, termMax: 12,
    attributesJson: attrs([{ key: "capitalization", value: "Да", isComparable: true }]) }));
  P.push(pub({ bankId: B.eskhata, categoryId: C.deposit, name: "Срочный депозит USD", currency: "USD",
    effectiveRate: 5.0, amountMin: 100, amountMax: 1000000, termMin: 6, termMax: 24,
    attributesJson: attrs([{ key: "capitalization", value: "Нет", isComparable: true }]) }));
  P.push(pub({ bankId: B.ibt, categoryId: C.deposit, name: "Депозит «Ҷамъ»", currency: "TJS",
    effectiveRate: 15.0, amountMin: 500, amountMax: 5000000, termMin: 3, termMax: 36,
    attributesJson: attrs([{ key: "capitalization", value: "Да", isComparable: true }]) }));
  P.push(pub({ bankId: B.arvand, categoryId: C.deposit, name: "Депозит «Волидайн»", currency: "TJS",
    effectiveRate: 15.0, amountMin: 100, amountMax: 3000000, termMin: 3, termMax: 24,
    attributesJson: attrs([{ key: "capitalization", value: "Да", isComparable: true }]) }));

  /* ---------- ДЕБЕТОВЫЕ КАРТЫ (таблица №3) ---------- */
  P.push(pub({ bankId: B.eskhata, categoryId: C.debit_card, name: "Visa Classic", currency: "TJS", effectiveRate: 0,
    attributesJson: attrs([{ key: "card_annual", value: "100", isComparable: true }, { key: "cashback_percent", value: "20", isComparable: true }]) }));
  P.push(pub({ bankId: B.alif, categoryId: C.debit_card, name: "Visa (мультивалютная)", currency: "TJS", effectiveRate: 0,
    attributesJson: attrs([{ key: "card_annual", value: "20", isComparable: true }, { key: "cashback_percent", value: "10", isComparable: true }]) }));
  P.push(pub({ bankId: B.humo, categoryId: C.debit_card, name: "Visa Gold", currency: "TJS", effectiveRate: 0,
    attributesJson: attrs([{ key: "card_annual", value: "20", isComparable: true }, { key: "cashback_percent", value: "3", isComparable: true }]) }));
  P.push(pub({ bankId: B.humo, categoryId: C.debit_card, name: "Корти Милли", currency: "TJS", effectiveRate: 0,
    attributesJson: attrs([{ key: "card_annual", value: "10", isComparable: true }, { key: "cashback_percent", value: "0", isComparable: true }]) }));
  P.push(pub({ bankId: B.ibt, categoryId: C.debit_card, name: "Mastercard World Elite", currency: "USD", effectiveRate: 0,
    attributesJson: attrs([{ key: "card_annual", value: "1500", isComparable: true }, { key: "cashback_percent", value: "1", isComparable: true }]) }));

  /* ---------- КРЕДИТНЫЕ КАРТЫ (раздел №4) ---------- */
  P.push(pub({ bankId: B.eskhata, categoryId: C.credit_card, name: "Кредитная линия по карте", currency: "TJS",
    effectiveRate: 29.5, amountMax: 30000,
    attributesJson: attrs([{ key: "grace_period_days", value: "0", isComparable: true }, { key: "credit_limit_max", value: "30000", isComparable: true }]) }));
  P.push(pub({ bankId: B.alif, categoryId: C.credit_card, name: "Карта рассрочки «Салом»", currency: "TJS",
    effectiveRate: 0, amountMax: 20000,
    attributesJson: attrs([{ key: "grace_period_days", value: "730", isComparable: true }, { key: "credit_limit_max", value: "20000", isComparable: true }]) }));
  P.push(pub({ bankId: B.tawhid, categoryId: C.credit_card, name: "Исламская карта «Сабз»", currency: "TJS",
    effectiveRate: 0, amountMin: 3000, amountMax: 6000,
    attributesJson: attrs([{ key: "grace_period_days", value: "—", isComparable: false }, { key: "credit_limit_max", value: "6000", isComparable: true }]) }));

  /* ---------- ИПОТЕКА (таблица №5) ---------- */
  P.push(pub({ bankId: B.amonat, categoryId: C.mortgage, name: "Ипотека (покупка квартиры)", currency: "TJS",
    rateMin: 14, rateMax: 14, effectiveRate: 14.0, amountMin: 50000, amountMax: 1000000, termMin: 12, termMax: 84,
    requirementsJson: reqs({ min_work_experience_months: 6, down_payment_min_percent: 20 }),
    attributesJson: attrs([{ key: "down_payment_min", value: "20", isComparable: true }]) }));
  P.push(pub({ bankId: B.spitamen, categoryId: C.mortgage, name: "Ипотечный кредит USD", currency: "USD",
    rateMin: 14, rateMax: 16, effectiveRate: 14.0, amountMin: 10000, amountMax: 300000, termMin: 24, termMax: 120,
    attributesJson: attrs([{ key: "down_payment_min", value: "25", isComparable: true }]) }));
  P.push(pub({ bankId: B.eskhata, categoryId: C.mortgage, name: "Ипотека", currency: "TJS",
    rateMin: 22, rateMax: 22, effectiveRate: 22.0, amountMin: 50000, amountMax: 500000, termMin: 24, termMax: 120,
    attributesJson: attrs([{ key: "down_payment_min", value: "30", isComparable: true }]) }));
  P.push(pub({ bankId: B.dc, categoryId: C.mortgage, name: "Ипотека", currency: "TJS",
    rateMin: 8, rateMax: 14, effectiveRate: 8.0, amountMin: 50000, amountMax: 800000, termMin: 12, termMax: 96,
    attributesJson: attrs([{ key: "down_payment_min", value: "30", isComparable: true }]) }));
  P.push(pub({ bankId: B.arvand, categoryId: C.mortgage, name: "Жилищный «Иморат»", currency: "TJS",
    rateMin: 28, rateMax: 28, effectiveRate: 28.0, amountMin: 20000, amountMax: 200000, termMin: 12, termMax: 120,
    attributesJson: attrs([{ key: "down_payment_min", value: "20", isComparable: true }]) }));

  /* ---------- МИКРОЗАЙМЫ (таблица №6) ---------- */
  P.push(pub({ bankId: B.humo, categoryId: C.microloan, name: "«Орзу» онлайн", currency: "TJS",
    effectiveRate: 32, amountMin: 500, amountMax: 50000, termMin: 3, termMax: 48,
    attributesJson: attrs([{ key: "approval_time", value: "30 секунд", isComparable: false }]) }));
  P.push(pub({ bankId: B.arvand, categoryId: C.microloan, name: "«Тез Карз» (быстрый)", currency: "TJS",
    effectiveRate: 32, amountMin: 100, amountMax: 3000, termMin: 1, termMax: 2,
    attributesJson: attrs([{ key: "approval_time", value: "1 день", isComparable: false }]) }));

  /* ---------- РКО (таблица №7) ---------- */
  P.push(pub({ bankId: B.eskhata, categoryId: C.rko, name: "«Эсхата Бизнес»", currency: "TJS",
    attributesJson: attrs([{ key: "monthly_service", value: "0", isComparable: true }, { key: "free_payments", value: "24/7", isComparable: false }]) }));
  P.push(pub({ bankId: B.alif, categoryId: C.rko, name: "Alif Business (9+ валют)", currency: "TJS",
    attributesJson: attrs([{ key: "monthly_service", value: "0", isComparable: true }, { key: "free_payments", value: "∞", isComparable: false }]) }));
  P.push(pub({ bankId: B.spitamen, categoryId: C.rko, name: "РКО + интернет-банкинг", currency: "TJS",
    attributesJson: attrs([{ key: "monthly_service", value: "0", isComparable: true }]) }));

  /* ---------- СТРАХОВАНИЕ (раздел №8; страховые продукты через банки-партнёры) ---------- */
  P.push(pub({ bankId: B.spitamen, categoryId: C.insurance, name: "КАСКО Плюс (Спитамен Иншуренс)", currency: "TJS",
    attributesJson: attrs([{ key: "premium_from", value: "140", isComparable: true }, { key: "coverage_max", value: "500000", isComparable: true }]) }));
  P.push(pub({ bankId: B.dc, categoryId: C.insurance, name: "DC Sugurta — авто и имущество", currency: "TJS",
    attributesJson: attrs([{ key: "premium_from", value: "156", isComparable: true }, { key: "coverage_max", value: "300000", isComparable: true }]) }));

  /* Черновик — демо BR-01 (draft не виден публично) */
  P.push({ status: "draft", bankId: B.tawhid, categoryId: C.mortgage, name: "Мурабаха «Манзил» (черновик)", currency: "TJS",
    effectiveRate: 0, amountMin: 50000, amountMax: 500000, termMin: 12, termMax: 120 });

  return P;
}

async function main() {
  console.log("Очистка…");
  await db.idempotencyKey.deleteMany();
  await db.leadDeliveryLog.deleteMany();
  await db.application.deleteMany();
  await db.product.deleteMany();
  await db.productCategory.deleteMany();
  await db.exchangeRate.deleteMany();
  await db.bank.deleteMany();
  await db.adminUser.deleteMany();
  await db.auditLog.deleteMany();

  console.log("Категории…");
  const C: Record<string, string> = {};
  for (const c of CATS) {
    const row = await db.productCategory.create({ data: c });
    C[c.code] = row.id;
  }

  console.log("Банки…");
  const B: Record<string, string> = {};
  for (const b of BANKS) {
    const { key, ...data } = b;
    const row = await db.bank.create({ data: { ...data, verified: true, status: "active", webhookSecret: "demo_secret_" + b.logoText } });
    B[key] = row.id;
  }

  console.log("Курсы валют (НБТ)…");
  for (const r of RATES) {
    await db.exchangeRate.create({ data: r });
  }

  console.log("Продукты…");
  const products = buildProducts(B, C);
  for (const p of products) await db.product.create({ data: p });

  console.log("Администраторы…");
  await db.adminUser.createMany({
    data: [
      { email: "admin@finmarket.tj", password: "admin123", role: "admin" },
      { email: "editor@finmarket.tj", password: "editor123", role: "editor" },
      { email: "viewer@finmarket.tj", password: "viewer123", role: "viewer" },
    ],
  });

  console.log(`Готово: ${CATS.length} категорий, ${BANKS.length} банков, ${RATES.length} валют, ${products.length} продуктов, 3 админа.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
