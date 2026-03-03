import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { todayString, isGoalActiveOnDate } from "@/lib/utils";
import { calculateDailyScore } from "@/lib/scoring";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ?? todayString();
  const to = searchParams.get("to") ?? todayString();

  const scores = await prisma.dailyScore.findMany({
    where: { date: { gte: from, lte: to } },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(scores);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const date = (body as { date?: string }).date ?? todayString();

  const goals = await prisma.goal.findMany({
    where: { isArchived: false },
    include: { dailyLogs: { where: { date } }, streaks: true },
  });

  const overallStreak = await prisma.streak.findFirst({
    where: { goalId: null },
  });

  const scoreGoals = goals.map((g) => {
    const log = g.dailyLogs[0];
    return {
      goalType: g.goalType as "timer" | "checkbox",
      dailyTarget: g.dailyTarget,
      priority: g.priority,
      isActiveToday: isGoalActiveOnDate(g.activeDays, date),
      timeSpent: log?.timeSpent ?? 0,
      completed: log?.completed ?? false,
    };
  });

  const activeGoalStreaks = goals.filter(
    (g) => (g.streaks[0]?.currentStreak ?? 0) > 0
  ).length;
  const overallStreakActive = (overallStreak?.currentStreak ?? 0) > 0;

  const result = calculateDailyScore({
    goals: scoreGoals,
    activeGoalStreaks,
    overallStreakActive,
  });

  const score = await prisma.dailyScore.upsert({
    where: { date },
    update: {
      score: result.score,
      goalsCompleted: result.goalsCompleted,
      goalsTotal: result.goalsTotal,
      totalHours: result.totalHours,
      targetHours: result.targetHours,
      streakBonus: result.breakdown.streakBonus,
    },
    create: {
      date,
      score: result.score,
      goalsCompleted: result.goalsCompleted,
      goalsTotal: result.goalsTotal,
      totalHours: result.totalHours,
      targetHours: result.targetHours,
      streakBonus: result.breakdown.streakBonus,
    },
  });

  return NextResponse.json({ ...score, breakdown: result.breakdown });
}
