import { NextResponse } from "next/server";
import Stripe from "stripe";
import { checkoutInput, priceCart } from "@/lib/checkout";
import { quoteDelivery, DeliveryUnavailableError } from "@/lib/delivery";
import { orderDb } from "@/lib/orders-db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (process.env.ORDERING_ENABLED !== "true") {
    return NextResponse.json({ error: "Online checkout is not open yet." }, { status: 503 });
  }
  const parsed = checkoutInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check your order and delivery details." }, { status: 400 });
  let cart;
  try {
    cart = priceCart(parsed.data.items);
  } catch {
    return NextResponse.json({ error: "One or more menu items are unavailable." }, { status: 400 });
  }
  try {
    const quote = await quoteDelivery(parsed.data.address);
    const secret = process.env.STRIPE_SECRET_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!secret || !baseUrl || !process.env.STRIPE_WEBHOOK_SECRET || !process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Checkout is still being configured." }, { status: 503 });
    }
    const sql = orderDb();
    const id = crypto.randomUUID();
    await sql`INSERT INTO orders (id, status, customer_name, customer_email, customer_phone, address, items, instructions, subtotal_cents, delivery_fee_cents)
      VALUES (${id}, 'pending_payment', ${parsed.data.customer.name}, ${parsed.data.customer.email}, ${parsed.data.customer.phone}, ${JSON.stringify(parsed.data.address)}, ${JSON.stringify(cart.items)}, ${parsed.data.instructions || null}, ${cart.subtotalCents}, ${quote.feeCents})`;
    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: parsed.data.customer.email,
      client_reference_id: id,
      metadata: { orderId: id, deliveryQuoteId: quote.quoteId },
      line_items: [
        ...cart.items.map((item) => ({ price_data: { currency: "usd", product_data: { name: item.name }, unit_amount: item.unitPriceCents }, quantity: item.quantity })),
        { price_data: { currency: "usd", product_data: { name: "Delivery" }, unit_amount: quote.feeCents }, quantity: 1 },
      ],
      automatic_tax: { enabled: true },
      success_url: `${baseUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
    }, { idempotencyKey: id });
    await sql`UPDATE orders SET stripe_session_id = ${session.id}, updated_at = now() WHERE id = ${id}`;
    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof DeliveryUnavailableError) return NextResponse.json({ error: error.message }, { status: 503 });
    console.error("Checkout setup failed", error);
    return NextResponse.json({ error: "Checkout could not start. You have not been charged." }, { status: 500 });
  }
}
