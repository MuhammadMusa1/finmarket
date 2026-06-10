import { db } from "@/lib/db";

// GET /api/rates — курсы валют (НБТ + покупка/продажа). Public.
export async function GET() {
  const rates = await db.exchangeRate.findMany({ orderBy: { code: "asc" } });
  return Response.json({
    base: "TJS",
    updated_at: rates[0]?.updatedAt ?? null,
    items: rates.map((r: any) => ({
      code: r.code,
      name_ru: r.nameRu,
      name_tj: r.nameTj,
      nbt: r.nbt,
      buy: r.buy,
      sell: r.sell,
    })),
  });
}
