import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { todayString } from "@/lib/utils";
import { withApiHandler } from "@/lib/api";

export const POST = withApiHandler(async (req: NextRequest) => {
  const { id } = (await req.json()) as { id: string };

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const date = todayString();

  const existing = await prisma.extraCurricularLog.findUnique({
    where: { extraCurricularId_date: { extraCurricularId: id, date } },
  });

  const log = await prisma.extraCurricularLog.upsert({
    where: { extraCurricularId_date: { extraCurricularId: id, date } },
    update: { completed: !existing?.completed },
    create: { extraCurricularId: id, date, completed: true },
  });

  return NextResponse.json(log);
});
