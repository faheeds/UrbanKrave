"use client";

import Link from "next/link";
import { useState } from "react";
import { formatCents } from "@/lib/ordering-menu";
import type { StoredOrder } from "@/lib/orders-db";

export default function Kitchen() {
  const [orders, setOrders] = useState<StoredOrder[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [credentials, setCredentials] = useState("");
  async function load(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError("");
    const values = new FormData(event.currentTarget);
    const credentials = btoa(`${values.get("user")}:${values.get("password")}`);
    try {
      const response = await fetch("/api/admin/orders", { headers: { Authorization: `Basic ${credentials}` }, cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Orders could not be loaded.");
      setOrders(body.orders);
      setCredentials(credentials);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Orders could not be loaded."); }
    setBusy(false);
  }
  async function advance(order: StoredOrder) {
    setError("");
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, { method: "PATCH", headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/json" }, body: JSON.stringify({ status: order.status }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Order could not be updated.");
      setOrders((all) => all?.map((item) => item.id === order.id ? { ...item, status: body.status } : item) || null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Order could not be updated."); }
  }
  return <main className="kitchen-page"><Link href="/" className="brand">Urban <em>Krave</em></Link><div className="kicker">Kitchen dashboard</div><h1>Direct orders</h1>
    <p>Paid website orders appear here after Stripe confirms payment. Delivery dispatch is not connected yet.</p>
    <form onSubmit={load} className="kitchen-login"><label>Username<input name="user" autoComplete="username" required/></label><label>Password<input name="password" type="password" autoComplete="current-password" required/></label><button className="button primary" disabled={busy}>{busy ? "Loading…" : orders ? "Refresh orders" : "View orders"}</button></form>
    {error && <p role="alert" className="checkout-error">{error}</p>}
    {orders && <section className="kitchen-orders" aria-live="polite">{orders.length === 0 ? <p>No paid website orders yet.</p> : orders.map((order) => <article key={order.id}><div className="kitchen-order-head"><h2>{order.customer_name}</h2><span>{order.status}</span></div><p>{new Date(order.created_at).toLocaleString()} · {order.customer_phone} · {order.customer_email}</p><ul>{order.items.map((item) => <li key={item.id}>{item.quantity} × {item.name}</li>)}</ul><p>{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city}, {order.address.state} {order.address.postalCode}</p>{order.instructions && <p>Instructions: {order.instructions}</p>}<strong>Food {formatCents(order.subtotal_cents)} · Delivery {formatCents(order.delivery_fee_cents)}</strong><div className="kitchen-actions">{order.status === "paid" && <button className="button primary" onClick={() => advance(order)}>Accept order</button>}{order.status === "accepted" && <button className="button primary" onClick={() => advance(order)}>Start preparation</button>}{order.status === "preparing" && <button className="button primary" onClick={() => advance(order)}>Mark ready</button>}</div></article>)}</section>}
  </main>;
}
