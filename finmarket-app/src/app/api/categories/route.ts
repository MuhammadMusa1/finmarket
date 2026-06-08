import { db } from "@/lib/db";
export async function GET() {
  const cats = await db.productCategory.findMany({ orderBy: { sortOrder: "asc" } });
  return Response.json(cats.map((c: any) => ({ id: c.id, code: c.code, name_tj: c.nameTj, name_ru: c.nameRu, sort_order: c.sortOrder })));
}
