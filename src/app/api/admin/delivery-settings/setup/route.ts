import { NextResponse } from "next/server";
import { kitchenAuthorized } from "@/lib/kitchen-auth";
import { initializeDeliverySettings } from "@/lib/delivery-settings-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (!process.env.KITCHEN_USER || !process.env.KITCHEN_PASSWORD) return NextResponse.json({ error: "Kitchen dashboard is not configured." }, { status: 503, headers });
  if (!kitchenAuthorized(request)) return NextResponse.json({ error: "Incorrect kitchen login." }, { status: 401, headers });
  try {
    const settings = await initializeDeliverySettings();
    return NextResponse.json({ settings, settingsAvailable: true }, { headers });
  } catch {
    return NextResponse.json({ error: "Delivery settings could not be initialized. Please check the dedicated database connection." }, { status: 503, headers });
  }
}
