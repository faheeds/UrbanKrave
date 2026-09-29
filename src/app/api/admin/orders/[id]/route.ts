import { NextResponse } from "next/server";
import { z } from "zod";
import { kitchenAuthorized } from "@/lib/kitchen-auth";
import { orderDb } from "@/lib/orders-db";

export const runtime = "nodejs";
const statuses = { paid: "accepted", accepted: "preparing", preparing: "ready" } as const;

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!process.env.KITCHEN_USER || !process.env.KITCHEN_PASSWORD) return NextResponse.json({ error: "Kitchen dashboard is not configured." }, { status: 503 });
  if (!kitchenAuthorized(request)) return NextResponse.json({ error: "Incorrect kitchen login." }, { status: 401 });
  const { id } = await context.params;
  if (!z.uuid().safeParse(id).success) return NextResponse.json({ error: "Invalid order." }, { status: 400 });
  const body = await request.json().catch(() => null);
  const current = z.enum(["paid", "accepted", "preparing"]).safeParse(body?.status);
  if (!current.success) return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  const next = statuses[current.data];
  const sql = orderDb();
  const updated = await sql`UPDATE orders SET status = ${next}, updated_at = now() WHERE id = ${id} AND status = ${current.data} RETURNING id`;
  if (!updated.length) return NextResponse.json({ error: "Order changed. Refresh and try again." }, { status: 409 });
  return NextResponse.json({ status: next });
}
