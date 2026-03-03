import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const settings = await prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const settings = await prisma.appSettings.update({
    where: { id: "singleton" },
    data: body,
  });
  return NextResponse.json(settings);
}
