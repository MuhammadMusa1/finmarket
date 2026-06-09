import { db } from "@/lib/db";
export async function GET() {
  const banks = await db.bank.findMany({
    where: { status: "active" },
    orderBy: [
      { isPartner: "desc" },
      { priority: "desc" },
      { rating: "desc" },
      { name: "asc" },
    ],
  });
  return Response.json(banks.map((b: any) => ({
    id: b.id,
    name: b.name,
    logoText: b.logoText,
    license_no: b.licenseNo,
    verified: b.verified,
    is_partner: b.isPartner,
    priority: b.priority,
    rating: b.rating,
  })));
}
