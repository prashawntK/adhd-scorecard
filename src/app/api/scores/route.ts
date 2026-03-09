import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";
import { prisma } from "@/lib/db";
import { todayString } from "@/lib/utils";
import { computeScoreForDate } from "@/lib/scoring-server";
import { withApiHandler } from "@/lib/api";

export const GET = withApiHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ?? todayString();
  const to = searchParams.get("to") ?? todayString();
  const fill = searchParams.get("fill") === "true";

  const scores = await prisma.dailyScore.findMany({
    where: { date: { gte: from, lte: to } },
    orderBy: { date: "asc" },
  });

  if (!fill) {
    return NextResponse.json(scores);
  }

  // Fill missing days with zeroed record for calendar/chart views
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scoreMap = new Map(scores.map((s: any) => [s.date, s]));

  // Fallback: use DailyLog for days that never had a DailyScore computed
  const logs = await prisma.dailyLog.findMany({
    where: { date: { gte: from, lte: to } },
    select: { date: true, completed: true, timeSpent: true, targetAtTime: true },
  });
  const logsByDate = new Map<string, { completed: number; total: number }>();
  for (const log of logs) {
    if (!logsByDate.has(log.date)) logsByDate.set(log.date, { completed: 0, total: 0 });
    const entry = logsByDate.get(log.date)!;
    entry.total++;
    if (log.completed || (log.targetAtTime > 0 && log.timeSpent >= log.targetAtTime)) {
      entry.completed++;
    }
  }

  const days: {
    date: string;
    score: number;
    goalsCompleted: number;
    goalsTotal: number;
  }[] = [];
  const current = new Date(from + "T00:00:00");
  const end = new Date(to + "T00:00:00");
  while (current <= end) {
    // Use date-fns format (local time) to avoid UTC offset shifting dates
    const d = format(current, "yyyy-MM-dd");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = scoreMap.get(d) as any;
    const logData = logsByDate.get(d);

    let score = rec?.score ?? 0;
    let goalsCompleted = rec?.goalsCompleted ?? 0;
    let goalsTotal = rec?.goalsTotal ?? 0;

    // No stored DailyScore — derive a basic score directly from DailyLog
    if (!rec && logData && logData.total > 0) {
      goalsCompleted = logData.completed;
      goalsTotal = logData.total;
      score = Math.round((logData.completed / logData.total) * 100);
    }

    days.push({ date: d, score, goalsCompleted, goalsTotal });
    current.setDate(current.getDate() + 1);
  }
  return NextResponse.json(days);
});

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json().catch(() => ({}));
  const date = (body as { date?: string }).date ?? todayString();

  const result = await computeScoreForDate(date);

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
});
