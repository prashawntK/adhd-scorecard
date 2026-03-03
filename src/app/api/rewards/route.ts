import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const rewards = await prisma.reward.findMany({
    where: { isActive: true },
    orderBy: { cost: "asc" },
  });
  return NextResponse.json(rewards);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const reward = await prisma.reward.create({ data: body });
  return NextResponse.json(reward, { status: 201 });
}
