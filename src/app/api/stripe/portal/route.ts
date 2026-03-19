import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { getAuthUserId, withApiHandler } from "@/lib/api";

export const POST = withApiHandler(async () => {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account found" }, { status: 404 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings`,
  });

  return NextResponse.json({ url: session.url });
});
