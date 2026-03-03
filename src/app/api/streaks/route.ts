import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { todayString } from "@/lib/utils";

export async function GET() {
  const streaks = await prisma.streak.findMany({ include: { goal: true } });
  return NextResponse.json(streaks);
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "freeze") {
    const { goalId } = await req.json();
    const streak = await prisma.streak.findFirst({
      where: goalId ? { goalId } : { goalId: null },
    });
    if (!streak)
      return NextResponse.json({ error: "Streak not found" }, { status: 404 });

    const settings = await prisma.appSettings.findUnique({
      where: { id: "singleton" },
    });
    const limit = settings?.weeklyFreezeLimit ?? 2;

    if ((streak.freezesUsedThisWeek ?? 0) >= limit) {
      return NextResponse.json(
        { error: "No freezes remaining this week" },
        { status: 400 }
      );
    }

    const updated = await prisma.streak.update({
      where: { id: streak.id },
      data: {
        freezesUsedThisWeek: { increment: 1 },
        lastFreezeDate: todayString(),
      },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
