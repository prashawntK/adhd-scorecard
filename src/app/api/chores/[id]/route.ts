import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withApiHandler } from "@/lib/api";

export const PATCH = withApiHandler(async (req: NextRequest, ctx) => {
  const { id } = await ctx.params;
  const body = await req.json();

  // Convert deadline string to Date if provided
  if (body.deadline) body.deadline = new Date(body.deadline);

  const item = await prisma.chore.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(item);
});

export const DELETE = withApiHandler(async (_req, ctx) => {
  const { id } = await ctx.params;

  const item = await prisma.chore.update({
    where: { id },
    data: { isArchived: true, archivedAt: new Date() },
  });

  return NextResponse.json(item);
});
