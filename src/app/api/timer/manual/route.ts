import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { todayString } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const { goalId, minutes, date, focusRating } = await req.json();
  const logDate = date ?? todayString();
  const durationHours = minutes / 60;

  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal)
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });

  await prisma.timerSession.create({
    data: {
      goalId,
      date: logDate,
      startTime: new Date(),
      endTime: new Date(),
      duration: durationHours,
      sessionType: "manual",
      focusRating: focusRating ?? null,
      isActive: false,
    },
  });

  const log = await prisma.dailyLog.upsert({
    where: { goalId_date: { goalId, date: logDate } },
    update: { timeSpent: { increment: durationHours } },
    create: {
      goalId,
      date: logDate,
      timeSpent: durationHours,
      targetAtTime: goal.dailyTarget,
    },
  });

  return NextResponse.json(log);
}
