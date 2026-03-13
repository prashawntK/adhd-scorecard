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

  const existing = await prisma.choreCompletionLog.findUnique({
    where: { choreId_date: { choreId: id, date } },
  });

  const log = await prisma.choreCompletionLog.upsert({
    where: { choreId_date: { choreId: id, date } },
    update: { completed: !existing?.completed },
    create: { choreId: id, date, completed: true },
  });

  return NextResponse.json(log);
});
