export type CartLine = { id: string; quantity: number };
const KEY = "urban-krave-cart-v1";

export function readCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter((line) => typeof line.id === "string" && Number.isInteger(line.quantity) && line.quantity > 0 && line.quantity <= 20);
  } catch { return []; }
}

export function writeCart(lines: CartLine[]) {
  localStorage.setItem(KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event("urban-krave-cart"));
}

export function addToCart(id: string) {
  const lines = readCart();
  const found = lines.find((line) => line.id === id);
  if (found) found.quantity = Math.min(20, found.quantity + 1);
  else lines.push({ id, quantity: 1 });
  writeCart(lines);
}
