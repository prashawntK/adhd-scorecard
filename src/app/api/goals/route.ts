import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withApiHandler, getAuthUserId } from "@/lib/api";
import { PLAN_LIMITS } from "@/lib/plan";

export const GET = withApiHandler(async (req: NextRequest) => {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const showArchived = searchParams.get("archived") === "true";

  const goals = await prisma.goal.findMany({
    where: { isArchived: showArchived, userId },
    orderBy: { sortOrder: "asc" },
    include: { streaks: true, steps: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json(goals);
});

export const POST = withApiHandler(async (req: NextRequest) => {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const {
    name,
    emoji = "🎯",
    category,
    goalType = "timer",
    dailyTarget = 0,
    priority = "should",
    activeDays = [0, 1, 2, 3, 4, 5, 6],
    description,
    motivation,
    pomodoroSettings,
    sortOrder = 0,
    steps = [],
  } = body;

  // Enforce free tier goal limit
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
  const plan = (user?.plan ?? "free") as "free" | "pro";
  if (plan === "free") {
    const goalCount = await prisma.goal.count({ where: { userId, isArchived: false } });
    if (goalCount >= PLAN_LIMITS.free.maxGoals) {
      return NextResponse.json(
        { error: `Free plan allows up to ${PLAN_LIMITS.free.maxGoals} active goals. Upgrade to Pro for unlimited goals.`, code: "PLAN_LIMIT" },
        { status: 403 }
      );
    }
  }

  if (!name || !category) {
    return NextResponse.json(
      { error: "name and category are required" },
      { status: 400 }
    );
  }

  const validSteps = (steps as { name: string }[]).filter((s) => s.name?.trim());

  const goal = await prisma.goal.create({
    data: {
      name,
      emoji,
      category,
      goalType,
      dailyTarget,
      priority,
      activeDays,
      description,
      motivation,
      pomodoroSettings,
      sortOrder,
      userId,
      ...(validSteps.length > 0 && {
        steps: {
          create: validSteps.map((s, i) => ({ name: s.name.trim(), sortOrder: i })),
        },
      }),
    },
  });

  await prisma.streak.create({ data: { goalId: goal.id, userId } });

  return NextResponse.json(goal, { status: 201 });
});
