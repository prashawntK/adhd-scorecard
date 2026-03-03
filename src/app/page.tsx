import { DashboardView } from "@/components/dashboard/DashboardView";
import { prisma } from "@/lib/db";
import { todayString, isGoalActiveOnDate } from "@/lib/utils";
import { calculateDailyScore } from "@/lib/scoring";
import type { DashboardData } from "@/types";

const EMPTY_STATE: DashboardData = {
  goals: [],
  dailyScore: { score: 0, goalsCompleted: 0, goalsTotal: 0, totalHours: 0, targetHours: 0, streakBonus: 0 },
  overallStreak: { currentStreak: 0, longestStreak: 0 },
  yesterdayScore: null,
  totalPoints: 0,
  date: new Date().toISOString().slice(0, 10),
};

async function getDashboardData(): Promise<DashboardData> {
  try {
    const date = todayString();
    const yesterday = (() => {
      const d = new Date(date + "T00:00:00");
      d.setDate(d.getDate() - 1);
      return d.toISOString().slice(0, 10);
    })();

    const [goals, overallStreakRecord, yesterdayScore, pointsAggregate] = await Promise.all([
      prisma.goal.findMany({
        where: { isArchived: false },
        orderBy: { sortOrder: "asc" },
        include: {
          dailyLogs: { where: { date } },
          streaks: true,
          timerSessions: { where: { isActive: true } },
        },
      }),
      prisma.streak.findFirst({ where: { goalId: null } }),
      prisma.dailyScore.findUnique({ where: { date: yesterday } }),
      prisma.pointsLedger.aggregate({ _sum: { amount: true } }),
    ]);

    const goalsWithProgress = goals.map((goal) => {
      const log = goal.dailyLogs[0] ?? null;
      const streak = goal.streaks[0] ?? { id: "", currentStreak: 0, longestStreak: 0 };
      const activeSession = goal.timerSessions[0] ?? null;
      const isActiveToday = isGoalActiveOnDate(goal.activeDays, date);

      let completionPercentage = 0;
      if (goal.goalType === "checkbox") {
        completionPercentage = log?.completed ? 100 : 0;
      } else if (goal.dailyTarget > 0) {
        completionPercentage = Math.min(120, ((log?.timeSpent ?? 0) / goal.dailyTarget) * 100);
      }

      return {
        id: goal.id,
        name: goal.name,
        emoji: goal.emoji,
        category: goal.category,
        goalType: goal.goalType as "timer" | "checkbox",
        dailyTarget: goal.dailyTarget,
        priority: goal.priority as "must" | "should" | "want",
        activeDays: goal.activeDays as number[],
        pomodoroSettings: goal.pomodoroSettings as null,
        description: goal.description,
        motivation: goal.motivation,
        sortOrder: goal.sortOrder,
        isArchived: goal.isArchived,
        todayLog: log ? { id: log.id, completed: log.completed, timeSpent: log.timeSpent, focusRating: log.focusRating, note: log.note } : null,
        streak: { id: streak.id, currentStreak: streak.currentStreak, longestStreak: streak.longestStreak },
        activeSession: activeSession ? { id: activeSession.id, startTime: activeSession.startTime.toISOString(), goalId: activeSession.goalId } : null,
        completionPercentage: Math.round(completionPercentage),
        isActiveToday,
      };
    });

    const scoreResult = calculateDailyScore({
      goals: goalsWithProgress.filter((g) => g.isActiveToday).map((g) => ({
        goalType: g.goalType,
        dailyTarget: g.dailyTarget,
        priority: g.priority,
        isActiveToday: g.isActiveToday,
        timeSpent: g.todayLog?.timeSpent ?? 0,
        completed: g.todayLog?.completed ?? false,
      })),
      activeGoalStreaks: goalsWithProgress.filter((g) => g.streak.currentStreak > 0).length,
      overallStreakActive: (overallStreakRecord?.currentStreak ?? 0) > 0,
    });

    return {
      goals: goalsWithProgress,
      dailyScore: {
        score: scoreResult.score,
        goalsCompleted: scoreResult.goalsCompleted,
        goalsTotal: scoreResult.goalsTotal,
        totalHours: scoreResult.totalHours,
        targetHours: scoreResult.targetHours,
        streakBonus: scoreResult.breakdown.streakBonus,
      },
      overallStreak: {
        currentStreak: overallStreakRecord?.currentStreak ?? 0,
        longestStreak: overallStreakRecord?.longestStreak ?? 0,
      },
      yesterdayScore: yesterdayScore?.score ?? null,
      totalPoints: pointsAggregate._sum.amount ?? 0,
      date,
    };
  } catch {
    return EMPTY_STATE;
  }
}

export default async function Home() {
  const data = await getDashboardData();
  return <DashboardView initialData={data} />;
}
