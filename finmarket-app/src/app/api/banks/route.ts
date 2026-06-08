import { db } from "@/lib/db";
export async function GET() {
  const banks = await db.bank.findMany({ where: { status: "active" } });
  return Response.json(banks.map((b: any) => ({ id: b.id, name: b.name, logoText: b.logoText, license_no: b.licenseNo, verified: b.verified })));
}
