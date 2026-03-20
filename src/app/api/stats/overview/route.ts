import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getLast30Days, getLast7Days } from "@/lib/utils";
import { withApiHandler, getAuthUserId } from "@/lib/api";

export const GET = withApiHandler(async (req: NextRequest) => {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") ?? "month";

  const dates = period === "week" ? getLast7Days() : getLast30Days();
  const from = dates[0];
  const to = dates[dates.length - 1];

  const [scores, overallStreak] = await Promise.all([
    prisma.dailyScore.findMany({
      where: { date: { gte: from, lte: to }, userId },
      orderBy: { date: "asc" },
    }),
    prisma.streak.findFirst({ where: { goalId: null, userId } }),
  ]);

  // Use DailyScore.totalHours — already includes banked goal contributions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalHours = scores.reduce((s: number, sc: any) => s + (sc.totalHours ?? 0), 0);
  const avgScore =
    scores.length > 0
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? scores.reduce((s: number, sc: any) => s + sc.score, 0) / scores.length
      : 0;
  const bestDay =
    scores.length > 0
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? scores.reduce((best: any, s: any) => (s.score > best.score ? s : best), scores[0])
      : null;
  // Count days where any goals were completed or hours logged (includes banked days)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const daysWithActivity = scores.filter((sc: any) => sc.goalsCompleted > 0 || sc.totalHours > 0).length;
  const consistencyRate =
    dates.length > 0
      ? Math.round((daysWithActivity / dates.length) * 100)
      : 0;

  return NextResponse.json({
    totalHours: Math.round(totalHours * 10) / 10,
    averageScore: Math.round(avgScore),
    bestDay: bestDay ? { date: bestDay.date, score: bestDay.score } : null,
    consistencyRate,
    currentOverallStreak: overallStreak?.currentStreak ?? 0,
    daysWithActivity,
    topCategory: null,
    period,
  });
});
