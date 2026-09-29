import { z } from "zod";
import { menuById } from "./ordering-menu";

export const checkoutInput = z.object({
  items: z.array(z.object({ id: z.string(), quantity: z.number().int().min(1).max(20) })).min(1).max(30),
  customer: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.email(),
    phone: z.string().trim().min(7).max(25),
  }),
  address: z.object({
    line1: z.string().trim().min(3).max(150),
    line2: z.string().trim().max(150).optional(),
    city: z.string().trim().min(2).max(100),
    state: z.string().trim().length(2),
    postalCode: z.string().trim().regex(/^\d{5}(?:-\d{4})?$/),
  }),
  instructions: z.string().trim().max(500).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutInput>;

export function priceCart(lines: CheckoutInput["items"]) {
  const seen = new Set<string>();
  let subtotalCents = 0;
  const items = lines.map(({ id, quantity }) => {
    if (seen.has(id)) throw new Error("Duplicate menu item");
    seen.add(id);
    const menuItem = menuById.get(id);
    if (!menuItem) throw new Error("Menu item unavailable");
    subtotalCents += menuItem.priceCents * quantity;
    return { id, name: menuItem.name, unitPriceCents: menuItem.priceCents, quantity };
  });
  return { items, subtotalCents };
}
