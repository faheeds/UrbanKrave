import { NextResponse } from "next/server";
import { kitchenAuthorized } from "@/lib/kitchen-auth";
import { checkoutInput } from "@/lib/checkout";
import { quoteUberDirect } from "@/lib/uber-direct";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (!process.env.KITCHEN_USER || !process.env.KITCHEN_PASSWORD) return NextResponse.json({ error: "Kitchen dashboard is not configured." }, { status: 503, headers });
  if (!kitchenAuthorized(request)) return NextResponse.json({ error: "Incorrect kitchen login." }, { status: 401, headers });
  const parsed = checkoutInput.shape.address.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a complete delivery street address, city, state, and ZIP code." }, { status: 400, headers });
  try {
    const quote = await quoteUberDirect(parsed.data);
    return NextResponse.json({ quoteId: quote.quoteId, feeCents: quote.feeCents, expires: quote.expires }, { headers });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Uber Direct quote failed." }, { status: 502, headers });
  }
}
