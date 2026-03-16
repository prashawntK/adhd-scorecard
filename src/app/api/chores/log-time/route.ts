import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { todayString } from "@/lib/utils";
import { withApiHandler, getAuthUserId } from "@/lib/api";

export const POST = withApiHandler(async (req: NextRequest) => {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { choreId, minutesSpent } = (await req.json()) as {
    choreId: string;
    minutesSpent: number;
  };

  if (!choreId) {
    return NextResponse.json(
      { error: "choreId is required" },
      { status: 400 }
    );
  }
  if (!minutesSpent || minutesSpent <= 0) {
    return NextResponse.json(
      { error: "minutesSpent must be positive" },
      { status: 400 }
    );
  }

  const date = todayString();

  const log = await prisma.choreTimeLog.create({
    data: { choreId, date, minutesSpent, userId },
  });

  return NextResponse.json(log, { status: 201 });
});
