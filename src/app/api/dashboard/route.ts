import { NextRequest, NextResponse } from "next/server";
import { todayString } from "@/lib/utils";
import { assembleDashboardData } from "@/lib/dashboard";
import { withApiHandler, getAuthUserId } from "@/lib/api";

export const GET = withApiHandler(async (req: NextRequest) => {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") ?? todayString();
  const data = await assembleDashboardData(date, userId);
  return NextResponse.json(data);
});
