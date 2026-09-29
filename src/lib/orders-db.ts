import { neon } from "@neondatabase/serverless";

export type StoredOrder = {
  id: string;
  created_at: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: Record<string, string>;
  items: Array<{ id: string; name: string; unitPriceCents: number; quantity: number }>;
  instructions: string | null;
  subtotal_cents: number;
  delivery_fee_cents: number;
  stripe_session_id: string | null;
};

export function orderDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Urban Krave order database is not configured");
  return neon(url);
}

export async function listOrders() {
  const sql = orderDb();
  return (await sql`SELECT id, created_at, status, customer_name, customer_email, customer_phone, address, items, instructions, subtotal_cents, delivery_fee_cents, stripe_session_id FROM orders WHERE status IN ('paid', 'accepted', 'preparing', 'ready') ORDER BY created_at DESC LIMIT 100`) as StoredOrder[];
}
