import { db } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams;

  const where: any = { status: "published" }; // BR-01: draft не виден публично

  const category = q.get("category");
  if (category) where.category = { code: category };
  const bank = q.get("bank");
  if (bank) where.bankId = bank;
  const currency = q.get("currency");
  if (currency) where.currency = currency;

  const rateMax = q.get("rate_max");
  if (rateMax) where.effectiveRate = { lte: Number(rateMax) };

  const amount = q.get("amount");
  if (amount) {
    where.AND = [
      { OR: [{ amountMin: null }, { amountMin: { lte: Number(amount) } }] },
      { OR: [{ amountMax: null }, { amountMax: { gte: Number(amount) } }] },
    ];
  }
  const term = q.get("term");
  if (term) {
    where.AND = [...(where.AND || []),
      { OR: [{ termMin: null }, { termMin: { lte: Number(term) } }] },
      { OR: [{ termMax: null }, { termMax: { gte: Number(term) } }] },
    ];
  }
  const search = q.get("q");
  if (search) where.name = { contains: search };

  const sort = q.get("sort");
  const orderBy: any[] =
    sort === "rate_desc" ? [{ bank: { isPartner: "desc" } }, { bank: { priority: "desc" } }, { effectiveRate: "desc" }] :
    sort === "amount_desc" ? [{ bank: { isPartner: "desc" } }, { bank: { priority: "desc" } }, { amountMax: "desc" }] :
    sort === "term_desc" ? [{ bank: { isPartner: "desc" } }, { bank: { priority: "desc" } }, { termMax: "desc" }] :
    [{ bank: { isPartner: "desc" } }, { bank: { priority: "desc" } }, { effectiveRate: "asc" }];

  const limit = Math.min(Number(q.get("limit") || 20), 100);
  const offset = Number(q.get("offset") || 0);

  const [items, total] = await Promise.all([
    db.product.findMany({ where, orderBy, take: limit, skip: offset, include: { bank: true, category: true } }),
    db.product.count({ where }),
  ]);

  return Response.json({
    items: items.map(serialize),
    total, limit, offset,
  });
}

function serialize(p: any) {
  return {
    id: p.id, name: p.name, category_code: p.category.code, currency: p.currency,
    rate_min: p.rateMin, rate_max: p.rateMax, effective_rate: p.effectiveRate,
    amount_min: p.amountMin, amount_max: p.amountMax, term_min: p.termMin, term_max: p.termMax,
    updated_at: p.updatedAt,
    bank: {
      id: p.bank.id,
      name: p.bank.name,
      logoText: p.bank.logoText,
      verified: p.bank.verified,
      license_no: p.bank.licenseNo,
      is_partner: p.bank.isPartner,
      priority: p.bank.priority,
      rating: p.bank.rating,
    },
  };
}
