import { NextResponse } from "next/server";
import { kitchenAuthorized } from "@/lib/kitchen-auth";
import { uberDirectCredentialsConfigured, verifyUberDirectCredentials } from "@/lib/uber-direct";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (!process.env.KITCHEN_USER || !process.env.KITCHEN_PASSWORD) return NextResponse.json({ error: "Kitchen dashboard is not configured." }, { status: 503, headers });
  if (!kitchenAuthorized(request)) return NextResponse.json({ error: "Incorrect kitchen login." }, { status: 401, headers });
  if (!uberDirectCredentialsConfigured()) return NextResponse.json({ error: "Uber Direct credentials are missing from this deployment." }, { status: 503, headers });
  try {
    await verifyUberDirectCredentials();
    return NextResponse.json({ verified: true, message: "Uber Direct accepted the Client ID and Client Secret. The Customer ID, delivery quotes, and dispatch have not been tested." }, { headers });
  } catch (error) {
    return NextResponse.json({ verified: false, error: error instanceof Error ? error.message : "Uber Direct verification failed." }, { status: 502, headers });
  }
}
