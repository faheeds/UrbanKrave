"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { readCart, writeCart, type CartLine } from "@/lib/cart";
import { menuById, formatCents } from "@/lib/ordering-menu";

export default function Checkout({ orderingOpen }: { orderingOpen: boolean }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { setCart(readCart()); }, []);
  const items = useMemo(() => cart.map((line) => ({ ...line, item: menuById.get(line.id) })).filter((line) => line.item), [cart]);
  const subtotal = items.reduce((sum, line) => sum + (line.item?.priceCents || 0) * line.quantity, 0);
  function update(id: string, quantity: number) {
    const next = cart.filter((line) => line.id !== id);
    if (quantity > 0) next.push({ id, quantity: Math.min(quantity, 20) });
    setCart(next);
    writeCart(next);
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const values = new FormData(event.currentTarget);
    const body = {
      items: cart,
      customer: { name: values.get("name"), email: values.get("email"), phone: values.get("phone") },
      address: { line1: values.get("line1"), line2: values.get("line2"), city: values.get("city"), state: values.get("state"), postalCode: values.get("postalCode") },
      instructions: values.get("instructions"),
    };
    try {
      const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok || !result.url) throw new Error(result.error || "Checkout is unavailable.");
      window.location.assign(result.url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Checkout is unavailable.");
      setBusy(false);
    }
  }
  return <main className="checkout-page">
    <div className="kicker">Your order</div><h1>Build your next <em>krave.</em></h1>
    <p className="checkout-notice">Online checkout is being connected. You can build your bag now, but no payment or delivery order will be placed until we announce that ordering is open.</p>
    <div className="checkout-layout"><section className="checkout-cart"><h2>Your bag</h2>
      {items.length ? items.map(({ id, quantity, item }) => <article className="checkout-line" key={id}><div><strong>{item?.name}</strong><span>{formatCents(item?.priceCents || 0)} each</span></div><div className="quantity-control"><button type="button" aria-label={`Remove one ${item?.name}`} onClick={() => update(id, quantity - 1)}>−</button><span>{quantity}</span><button type="button" aria-label={`Add one ${item?.name}`} onClick={() => update(id, quantity + 1)}>+</button></div><b>{formatCents((item?.priceCents || 0) * quantity)}</b></article>) : <p>Your bag is empty. <Link href="/menu">Explore the menu</Link>.</p>}
      <div className="checkout-subtotal"><span>Food subtotal</span><strong>{formatCents(subtotal)}</strong></div><p className="checkout-small">Delivery fee and tax are calculated before payment. No charge will be made without a delivery quote.</p>
    </section>{orderingOpen ? <form className="checkout-form" onSubmit={submit}><h2>Delivery details</h2>
      <label>Full name<input name="name" autoComplete="name" required minLength={2}/></label>
      <label>Email<input name="email" type="email" autoComplete="email" required/></label>
      <label>Phone<input name="phone" type="tel" autoComplete="tel" required/></label>
      <label>Street address<input name="line1" autoComplete="address-line1" required/></label>
      <label>Apartment or suite<input name="line2" autoComplete="address-line2"/></label>
      <div className="checkout-row"><label>City<input name="city" autoComplete="address-level2" required/></label><label>State<input name="state" autoComplete="address-level1" maxLength={2} defaultValue="WA" required/></label><label>ZIP code<input name="postalCode" autoComplete="postal-code" pattern="[0-9]{5}(-[0-9]{4})?" required/></label></div>
      <label>Delivery instructions<textarea name="instructions" rows={3} maxLength={500}/></label>
      {error && <p className="checkout-error" role="alert">{error}</p>}
      <button className="button primary" disabled={!items.length || busy}>{busy ? "Checking availability…" : "Continue to secure payment"}</button>
      <p className="checkout-small">Payment is processed by Stripe only after delivery availability is confirmed.</p>
    </form> : <aside className="checkout-form"><h2>Checkout is coming soon</h2><p>Save your favorites in your bag while we finish secure payment and delivery. We are not collecting your address or charging you yet.</p><Link className="button secondary" href="/menu">Keep exploring the menu</Link></aside>}</div>
  </main>;
}
