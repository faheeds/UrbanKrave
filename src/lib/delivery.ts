import type { CheckoutInput } from "./checkout";

export class DeliveryUnavailableError extends Error {
  constructor() {
    super("Delivery quotes are not connected yet. No payment was started.");
  }
}

export async function quoteDelivery(_address: CheckoutInput["address"]): Promise<{ feeCents: number; quoteId: string }> {
  // DoorDash Drive access is pending. A real quote and serviceability check must replace this gate.
  throw new DeliveryUnavailableError();
}
