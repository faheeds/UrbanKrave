import { NextResponse } from "next/server";
import { z } from "zod";
import { kitchenAuthorized } from "@/lib/kitchen-auth";
import { getDeliverySettings, saveDeliverySettings } from "@/lib/delivery-settings-db";
import { defaultDeliverySettings, deliveryStages } from "@/lib/delivery-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const payload = z.object({
  paused: z.boolean(),
  preferredProvider: z.enum(["doordash_drive", "uber_direct"]).nullable(),
  doordashStage: z.enum(deliveryStages),
  uberStage: z.enum(deliveryStages),
}).strict();

function authorizationError(request: Request) {
  if (!process.env.KITCHEN_USER || !process.env.KITCHEN_PASSWORD) {
    return NextResponse.json({ error: "Kitchen dashboard is not configured." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  if (!kitchenAuthorized(request)) {
    return NextResponse.json({ error: "Incorrect kitchen login." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  return null;
}

export async function GET(request: Request) {
  const denied = authorizationError(request);
  if (denied) return denied;
  try {
    return NextResponse.json({ settings: await getDeliverySettings(), settingsAvailable: true, apiConnected: false, canResume: false }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ settings: defaultDeliverySettings, settingsAvailable: false, warning: "Delivery progress cannot be saved until the database setup is finished." }, { headers: { "Cache-Control": "no-store" } });
  }
}

export async function PATCH(request: Request) {
  const denied = authorizationError(request);
  if (denied) return denied;
  const parsed = payload.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid delivery settings." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  if (!parsed.data.paused) return NextResponse.json({ error: "Delivery cannot be resumed until a provider is connected and verified." }, { status: 409, headers: { "Cache-Control": "no-store" } });
  try {
    return NextResponse.json({ settings: await saveDeliverySettings(parsed.data), settingsAvailable: true, apiConnected: false, canResume: false }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Delivery settings could not be saved." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
