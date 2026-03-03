import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const [aggregate, recent] = await Promise.all([
    prisma.pointsLedger.aggregate({ _sum: { amount: true } }),
    prisma.pointsLedger.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
  ]);

  return NextResponse.json({ balance: aggregate._sum.amount ?? 0, recent });
}
