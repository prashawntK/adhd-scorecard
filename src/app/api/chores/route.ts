import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withApiHandler, getAuthUserId } from "@/lib/api";

export const GET = withApiHandler(async (req: NextRequest) => {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const showArchived = searchParams.get("archived") === "true";

  const items = await prisma.chore.findMany({
    where: { isArchived: showArchived, userId },
    orderBy: [{ deadline: "asc" }, { sortOrder: "asc" }],
    include: {
      timeLogs: { select: { minutesSpent: true } },
    },
  });

  // Flatten timeLogs into totalMinutesSpent for the client
  const result = items.map(({ timeLogs, ...chore }) => ({
    ...chore,
    totalMinutesSpent: timeLogs.reduce((sum, l) => sum + l.minutesSpent, 0),
  }));

  return NextResponse.json(result);
});

export const POST = withApiHandler(async (req: NextRequest) => {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    name,
    emoji = "\u{1F9F9}",
    deadline,
    estimatedMinutes = 30,
    description,
  } = body as {
    name?: string;
    emoji?: string;
    deadline?: string;
    estimatedMinutes?: number;
    description?: string;
  };

  if (!name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (!deadline) {
    return NextResponse.json(
      { error: "deadline is required" },
      { status: 400 }
    );
  }

  const maxSort = await prisma.chore.aggregate({
    _max: { sortOrder: true },
    where: { userId },
  });
  const sortOrder = (maxSort._max.sortOrder ?? -1) + 1;

  const item = await prisma.chore.create({
    data: {
      name: name.trim(),
      emoji,
      deadline: new Date(deadline),
      estimatedMinutes,
      description: description?.trim() || null,
      sortOrder,
      userId,
    },
  });

  return NextResponse.json(item, { status: 201 });
});
