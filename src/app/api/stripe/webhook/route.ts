import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

// Required for Stripe signature verification — do NOT use withApiHandler (it reads body)
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId) break;
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: "pro",
            stripeCustomerId: session.customer as string,
          },
        });
        console.log(`[Stripe] User ${userId} upgraded to pro`);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) {
          // Fall back to looking up by stripeCustomerId
          const user = await prisma.user.findFirst({
            where: { stripeCustomerId: sub.customer as string },
          });
          if (!user) break;
          const plan = sub.status === "active" ? "pro" : "free";
          await prisma.user.update({ where: { id: user.id }, data: { plan } });
          break;
        }
        const plan = sub.status === "active" ? "pro" : "free";
        await prisma.user.update({ where: { id: userId }, data: { plan } });
        console.log(`[Stripe] User ${userId} subscription updated → ${plan}`);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: sub.customer as string },
        });
        if (!user) break;
        await prisma.user.update({ where: { id: user.id }, data: { plan: "free" } });
        console.log(`[Stripe] User ${user.id} downgraded to free (subscription cancelled)`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: invoice.customer as string },
        });
        if (!user) break;
        // Only downgrade after repeated failures — Stripe retries before this fires
        await prisma.user.update({ where: { id: user.id }, data: { plan: "free" } });
        console.log(`[Stripe] User ${user.id} downgraded to free (payment failed)`);
        break;
      }

      default:
        // Unhandled event type — ignore silently
        break;
    }
  } catch (err) {
    console.error(`[Stripe Webhook] Error handling ${event.type}:`, err);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
