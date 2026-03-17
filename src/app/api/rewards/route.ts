import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withApiHandler, getAuthUserId } from "@/lib/api";

export const GET = withApiHandler(async () => {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rewards = await prisma.reward.findMany({
    where: { isActive: true, userId },
    orderBy: { cost: "asc" },
  });
  return NextResponse.json(rewards);
});

export const POST = withApiHandler(async (req: NextRequest) => {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const reward = await prisma.reward.create({ data: { ...body, userId } });
  return NextResponse.json(reward, { status: 201 });
});
