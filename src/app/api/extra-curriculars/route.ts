import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withApiHandler } from "@/lib/api";

export const GET = withApiHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const showArchived = searchParams.get("archived") === "true";

  const items = await prisma.extraCurricular.findMany({
    where: { isArchived: showArchived },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(items);
});

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { name, emoji = "✨" } = body as { name?: string; emoji?: string };

  if (!name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const maxSort = await prisma.extraCurricular.aggregate({ _max: { sortOrder: true } });
  const sortOrder = (maxSort._max.sortOrder ?? -1) + 1;

  const item = await prisma.extraCurricular.create({
    data: { name: name.trim(), emoji, sortOrder },
  });

  return NextResponse.json(item, { status: 201 });
});
