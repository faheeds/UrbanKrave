import type { CheckoutInput } from "./checkout";
import { getDeliverySettings } from "./delivery-settings-db";

export class DeliveryUnavailableError extends Error {
  constructor(message = "Delivery quotes are not connected yet. No payment was started.") {
    super(message);
  }
}

export async function quoteDelivery(_address: CheckoutInput["address"]): Promise<{ feeCents: number; quoteId: string }> {
  // Fail closed if admin settings are missing, paused, or the provider APIs are not connected.
  const settings = await getDeliverySettings().catch(() => null);
  if (!settings || settings.paused) throw new DeliveryUnavailableError("Website delivery is paused. No payment was started.");
  throw new DeliveryUnavailableError();
}
