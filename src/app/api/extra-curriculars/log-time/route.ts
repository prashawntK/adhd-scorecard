import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { todayString } from "@/lib/utils";
import { withApiHandler, getAuthUserId } from "@/lib/api";

export const POST = withApiHandler(async (req: NextRequest) => {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ecId, minutesSpent } = (await req.json()) as {
    ecId: string;
    minutesSpent: number;
  };

  if (!ecId) {
    return NextResponse.json(
      { error: "ecId is required" },
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

  const log = await prisma.extraCurricularTimeLog.create({
    data: { extraCurricularId: ecId, date, minutesSpent, userId },
  });

  return NextResponse.json(log, { status: 201 });
});
