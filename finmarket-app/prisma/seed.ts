import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

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

const BANKS = [
  { name: "ОАО «Банк Эсхата»", logoText: "ЭС", licenseNo: "0012", verified: true, status: "active", isPartner: true, priority: 100, rating: 4.8, webhookUrl: "https://webhook.site/demo-eskhata", routingEmail: "leads@eskhata.tj" },
  { name: "Амонатбанк", logoText: "АМ", licenseNo: "0001", webhookUrl: null, routingEmail: "leads@amonatbonk.tj" },
  { name: "Спитамен Банк", logoText: "СП", licenseNo: "0024", webhookUrl: "https://webhook.site/demo-spitamen", routingEmail: "leads@spitamen.tj" },
  { name: "Хучандбанк", logoText: "ХБ", licenseNo: "0031", webhookUrl: null, routingEmail: "leads@khujandbank.tj" },
  { name: "IMON International", logoText: "IM", licenseNo: "MF-105", webhookUrl: "https://webhook.site/demo-imon", routingEmail: "leads@imon.tj" },
];

const fees = (items: any[]) => JSON.stringify({ items });
const reqs = (o: any) => JSON.stringify(o);
const attrs = (a: any[]) => JSON.stringify(a);

function buildProducts(bankIds: string[], catIds: Record<string, string>) {
  const P: any[] = [];
  const pub = (extra: any) => ({ status: "published", publishedAt: new Date(), ...extra });

  // Кредиты
  P.push(pub({ bankId: bankIds[0], categoryId: catIds.credit, name: "Кредит «Соро»", currency: "TJS", rateMin: 14, rateMax: 16, effectiveRate: 15.0, amountMin: 5000, amountMax: 200000, termMin: 6, termMax: 36,
    feesJson: fees([{ code: "origination", label_tj: "Харчи кушодан", label_ru: "За оформление", type: "percent", value_percent: 1.5 }, { code: "early_repayment", label_ru: "Досрочное погашение", label_tj: "Пешакӣ", type: "free" }]),
    requirementsJson: reqs({ age_min: 21, age_max: 65, citizenship: ["TJ"], income_proof_required: true, min_work_experience_months: 6 }),
    attributesJson: attrs([{ key: "fee_origination", value: "1.5", isComparable: true }, { key: "early_repayment", value: "Бесплатно", isComparable: true }]) }));
  P.push(pub({ bankId: bankIds[1], categoryId: catIds.credit, name: "Потребительский кредит", currency: "TJS", rateMin: 17, rateMax: 20, effectiveRate: 18.5, amountMin: 3000, amountMax: 150000, termMin: 3, termMax: 24,
    feesJson: fees([{ code: "origination", label_ru: "За оформление", label_tj: "Кушодан", type: "percent", value_percent: 2.0 }]),
    requirementsJson: reqs({ age_min: 18, age_max: 60, citizenship: ["TJ"], income_proof_required: true }),
    attributesJson: attrs([{ key: "fee_origination", value: "2.0", isComparable: true }]) }));
  P.push(pub({ bankId: bankIds[4], categoryId: catIds.credit, name: "Бизнес-кредит «Рушд»", currency: "TJS", rateMin: 20, rateMax: 24, effectiveRate: 22.0, amountMin: 20000, amountMax: 500000, termMin: 12, termMax: 48,
    feesJson: fees([{ code: "origination", label_ru: "За оформление", label_tj: "Кушодан", type: "percent", value_percent: 2.5 }]),
    requirementsJson: reqs({ age_min: 23, citizenship: ["TJ"], income_proof_required: true }),
    attributesJson: attrs([{ key: "fee_origination", value: "2.5", isComparable: true }]) }));
  P.push(pub({ bankId: bankIds[2], categoryId: catIds.credit, name: "Кредит наличными", currency: "TJS", rateMin: 16, rateMax: 19, effectiveRate: 17.5, amountMin: 5000, amountMax: 180000, termMin: 6, termMax: 30,
    attributesJson: attrs([{ key: "fee_origination", value: "1.8", isComparable: true }]) }));

  // Депозиты
  P.push(pub({ bankId: bankIds[1], categoryId: catIds.deposit, name: "Депозит «Андӯхта»", currency: "TJS", effectiveRate: 9.5, amountMin: 1000, amountMax: 10000000, termMin: 6, termMax: 36,
    attributesJson: attrs([{ key: "capitalization", value: "Да", isComparable: true }, { key: "early_withdrawal", value: "С потерей %", isComparable: true }]) }));
  P.push(pub({ bankId: bankIds[0], categoryId: catIds.deposit, name: "Вклад «Боигарӣ»", currency: "TJS", effectiveRate: 11.0, amountMin: 5000, amountMax: 5000000, termMin: 12, termMax: 24,
    attributesJson: attrs([{ key: "capitalization", value: "Да", isComparable: true }]) }));
  P.push(pub({ bankId: bankIds[2], categoryId: catIds.deposit, name: "Срочный вклад USD", currency: "USD", effectiveRate: 4.5, amountMin: 500, amountMax: 1000000, termMin: 6, termMax: 24,
    attributesJson: attrs([{ key: "capitalization", value: "Нет", isComparable: true }]) }));

  // Дебетовые карты
  P.push(pub({ bankId: bankIds[0], categoryId: catIds.debit_card, name: "Карта «Корти милли»", currency: "TJS", effectiveRate: 0,
    attributesJson: attrs([{ key: "card_annual", value: "0", isComparable: true }, { key: "cashback_percent", value: "1", isComparable: true }]) }));
  P.push(pub({ bankId: bankIds[3], categoryId: catIds.debit_card, name: "Visa Classic", currency: "TJS", effectiveRate: 0,
    attributesJson: attrs([{ key: "card_annual", value: "60", isComparable: true }, { key: "cashback_percent", value: "0.5", isComparable: true }]) }));

  // Кредитные карты
  P.push(pub({ bankId: bankIds[2], categoryId: catIds.credit_card, name: "Кредитная карта «Озод»", currency: "TJS", effectiveRate: 24, amountMax: 50000,
    attributesJson: attrs([{ key: "grace_period_days", value: "55", isComparable: true }, { key: "credit_limit_max", value: "50000", isComparable: true }]) }));

  // Ипотека (одна в draft — для демо BR-01)
  P.push(pub({ bankId: bankIds[2], categoryId: catIds.mortgage, name: "Ипотека «Хонаи ман»", currency: "TJS", rateMin: 11, rateMax: 13, effectiveRate: 12.0, amountMin: 100000, amountMax: 2000000, termMin: 60, termMax: 240,
    attributesJson: attrs([{ key: "down_payment_min", value: "20", isComparable: true }]) }));
  P.push({ status: "draft", bankId: bankIds[0], categoryId: catIds.mortgage, name: "Ипотека «Оила» (черновик)", currency: "TJS", rateMin: 10, rateMax: 12, effectiveRate: 11.0, amountMin: 100000, amountMax: 1500000, termMin: 60, termMax: 180 });

  // Микрозаймы
  P.push(pub({ bankId: bankIds[4], categoryId: catIds.microloan, name: "Микрозайм «Зуд»", currency: "TJS", effectiveRate: 36, amountMin: 500, amountMax: 15000, termMin: 1, termMax: 6,
    attributesJson: attrs([{ key: "approval_time", value: "15 мин", isComparable: false }]) }));

  // РКО
  P.push(pub({ bankId: bankIds[0], categoryId: catIds.rko, name: "РКО «Старт»", currency: "TJS",
    attributesJson: attrs([{ key: "monthly_service", value: "50", isComparable: true }, { key: "free_payments", value: "10", isComparable: true }]) }));

  // Страхование
  P.push(pub({ bankId: bankIds[2], categoryId: catIds.insurance, name: "Страхование жизни", currency: "TJS",
    attributesJson: attrs([{ key: "premium_from", value: "200", isComparable: true }, { key: "coverage_max", value: "100000", isComparable: true }]) }));

  return P;
}

async function main() {
  console.log("Очистка…");
  await db.idempotencyKey.deleteMany();
  await db.leadDeliveryLog.deleteMany();
  await db.application.deleteMany();
  await db.product.deleteMany();
  await db.productCategory.deleteMany();
  await db.bank.deleteMany();
  await db.adminUser.deleteMany();
  await db.auditLog.deleteMany();

  console.log("Категории…");
  const catIds: Record<string, string> = {};
  for (const c of CATS) {
    const row = await db.productCategory.create({ data: c });
    catIds[c.code] = row.id;
  }

  console.log("Банки…");
  const bankIds: string[] = [];
  for (const b of BANKS) {
    const row = await db.bank.create({ data: { ...b, webhookSecret: "demo_secret_" + b.logoText } });
    bankIds.push(row.id);
  }

  console.log("Продукты…");
  const products = buildProducts(bankIds, catIds);
  for (const p of products) await db.product.create({ data: p });

  console.log("Администраторы…");
  await db.adminUser.createMany({
    data: [
      { email: "admin@finmarket.tj", password: "admin123", role: "admin" },
      { email: "editor@finmarket.tj", password: "editor123", role: "editor" },
      { email: "viewer@finmarket.tj", password: "viewer123", role: "viewer" },
    ],
  });

  console.log(`Готово: ${CATS.length} категорий, ${BANKS.length} банков, ${products.length} продуктов, 3 админа.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
