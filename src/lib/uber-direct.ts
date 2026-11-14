import { z } from "zod";

const tokenResponse = z.object({
  access_token: z.string().min(1),
  token_type: z.string(),
  scope: z.string(),
});

export function uberDirectCredentialsConfigured() {
  return Boolean(process.env.UBER_DIRECT_CUSTOMER_ID && process.env.UBER_DIRECT_CLIENT_ID && process.env.UBER_DIRECT_CLIENT_SECRET);
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.UBER_DIRECT_CLIENT_ID;
  const clientSecret = process.env.UBER_DIRECT_CLIENT_SECRET;
  const customerId = process.env.UBER_DIRECT_CUSTOMER_ID;
  if (!clientId || !clientSecret || !customerId) throw new Error("Uber Direct credentials are missing from this deployment.");

  let response: Response;
  try {
    response = await fetch("https://auth.uber.com/oauth/v2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: "client_credentials", scope: "eats.deliveries" }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new Error("Uber Direct could not be reached. Try again shortly.");
  }
  if (!response.ok) {
    if (response.status === 400 || response.status === 401 || response.status === 403) throw new Error("Uber Direct rejected these credentials. Check the values and their environment in Vercel.");
    throw new Error("Uber Direct could not verify credentials right now. Try again shortly.");
  }
  const parsed = tokenResponse.safeParse(await response.json().catch(() => null));
  if (!parsed.success || parsed.data.token_type.toLowerCase() !== "bearer" || !parsed.data.scope.split(" ").includes("eats.deliveries")) {
    throw new Error("Uber Direct returned an unexpected credential response.");
  }
  return parsed.data.access_token;
}

export async function verifyUberDirectCredentials(): Promise<void> {
  await getAccessToken();
}

export type UberDirectAddress = { line1: string; line2?: string; city: string; state: string; postalCode: string };

const quoteResponse = z.object({
  id: z.string().min(1),
  fee: z.number().int().nonnegative(),
  currency: z.string(),
  expires: z.string(),
});

function addressForUber(address: UberDirectAddress) {
  return JSON.stringify({
    street_address: [address.line1, ...(address.line2 ? [address.line2] : [])],
    city: address.city,
    state: address.state,
    zip_code: address.postalCode,
    country: "US",
  });
}

export async function quoteUberDirect(dropoff: UberDirectAddress) {
  const token = await getAccessToken();
  const customerId = process.env.UBER_DIRECT_CUSTOMER_ID;
  if (!customerId) throw new Error("Uber Direct Customer ID is missing from this deployment.");
  const pickup = { line1: "515 Broadway E", city: "Seattle", state: "WA", postalCode: "98102" };
  let response: Response;
  try {
    response = await fetch(`https://api.uber.com/v1/customers/${encodeURIComponent(customerId)}/delivery_quotes`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ pickup_address: addressForUber(pickup), dropoff_address: addressForUber(dropoff) }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new Error("Uber Direct could not be reached for a quote. Try again shortly.");
  }
  if (!response.ok) {
    if (response.status === 400 || response.status === 422) throw new Error("Uber Direct could not quote this delivery address. Check the address or delivery area.");
    if (response.status === 401 || response.status === 403) throw new Error("Uber Direct did not authorize the Customer ID or quote request. Check account approval and billing.");
    throw new Error("Uber Direct could not provide a quote right now. Try again shortly.");
  }
  const parsed = quoteResponse.safeParse(await response.json().catch(() => null));
  if (!parsed.success || parsed.data.currency.toLowerCase() !== "usd") throw new Error("Uber Direct returned an unexpected quote.");
  return { quoteId: parsed.data.id, feeCents: parsed.data.fee, expires: parsed.data.expires };
}
