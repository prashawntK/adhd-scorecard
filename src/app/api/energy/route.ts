import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { todayString } from "@/lib/utils";
import { withApiHandler, getAuthUserId } from "@/lib/api";

export const GET = withApiHandler(async (req: NextRequest) => {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") ?? todayString();
  const logs = await prisma.energyLog.findMany({
    where: { date, userId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(logs);
});

export const POST = withApiHandler(async (req: NextRequest) => {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { level, note } = await req.json();
  const now = new Date();
  const date = todayString();
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const log = await prisma.energyLog.create({
    data: { date, time, level, note, userId },
  });
  return NextResponse.json(log, { status: 201 });
});
