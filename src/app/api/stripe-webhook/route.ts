import { NextResponse } from "next/server";
import Stripe from "stripe";
import { orderDb } from "@/lib/orders-db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  let event: Stripe.Event;
  try {
    event = new Stripe(secret).webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const id = session.client_reference_id;
    if (id && session.payment_status === "paid") {
      const sql = orderDb();
      await sql`UPDATE orders SET status = 'paid', stripe_session_id = ${session.id}, stripe_payment_intent_id = ${typeof session.payment_intent === "string" ? session.payment_intent : null}, updated_at = now()
        WHERE id = ${id} AND status = 'pending_payment'`;
    }
  }
  return NextResponse.json({ received: true });
}
