import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const goal = await prisma.goal.findUnique({
    where: { id },
    include: {
      streaks: true,
      dailyLogs: { orderBy: { date: "desc" }, take: 30 },
    },
  });
  if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(goal);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const goal = await prisma.goal.update({ where: { id }, data: body });
  return NextResponse.json(goal);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const goal = await prisma.goal.update({
    where: { id },
    data: { isArchived: true, archivedAt: new Date() },
  });
  return NextResponse.json(goal);
}
