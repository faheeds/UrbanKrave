import { NextResponse } from "next/server";
import { listOrders } from "@/lib/orders-db";
import { kitchenAuthorized } from "@/lib/kitchen-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = process.env.KITCHEN_USER;
  const password = process.env.KITCHEN_PASSWORD;
  if (!user || !password) return NextResponse.json({ error: "Kitchen dashboard is not configured." }, { status: 503 });
  if (!kitchenAuthorized(request)) {
    return NextResponse.json({ error: "Incorrect kitchen login." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  try {
    const orders = await listOrders();
    return NextResponse.json({ orders }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Orders are temporarily unavailable." }, { status: 503 });
  }
}
