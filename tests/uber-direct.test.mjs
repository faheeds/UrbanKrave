import test from "node:test";
import assert from "node:assert/strict";
import { quoteUberDirect, uberDirectCredentialsConfigured, verifyUberDirectCredentials } from "../src/lib/uber-direct.ts";

const names = ["UBER_DIRECT_CUSTOMER_ID", "UBER_DIRECT_CLIENT_ID", "UBER_DIRECT_CLIENT_SECRET"];

async function withCredentials(values, run) {
  const previous = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  const previousFetch = globalThis.fetch;
  try {
    for (const name of names) {
      if (values[name] === undefined) delete process.env[name];
      else process.env[name] = values[name];
    }
    await run();
  } finally {
    for (const name of names) {
      if (previous[name] === undefined) delete process.env[name];
      else process.env[name] = previous[name];
    }
    globalThis.fetch = previousFetch;
  }
}

test("Uber Direct verification requires all server credentials", async () => {
  await withCredentials({}, async () => {
    assert.equal(uberDirectCredentialsConfigured(), false);
    await assert.rejects(verifyUberDirectCredentials(), /credentials are missing/);
  });
});

test("Uber Direct verification accepts only an eats.deliveries bearer token", async () => {
  await withCredentials({ UBER_DIRECT_CUSTOMER_ID: "customer", UBER_DIRECT_CLIENT_ID: "client", UBER_DIRECT_CLIENT_SECRET: "secret" }, async () => {
    globalThis.fetch = async (url, options) => {
      assert.equal(url, "https://auth.uber.com/oauth/v2/token");
      assert.equal(options.method, "POST");
      assert.equal(options.body.get("scope"), "eats.deliveries");
      assert.equal(options.body.get("client_secret"), "secret");
      return Response.json({ access_token: "token", token_type: "Bearer", scope: "eats.deliveries" });
    };
    assert.equal(uberDirectCredentialsConfigured(), true);
    await verifyUberDirectCredentials();
  });
});

test("Uber Direct verification rejects an invalid token without exposing the secret", async () => {
  await withCredentials({ UBER_DIRECT_CUSTOMER_ID: "customer", UBER_DIRECT_CLIENT_ID: "client", UBER_DIRECT_CLIENT_SECRET: "sensitive-secret" }, async () => {
    globalThis.fetch = async () => new Response("invalid credentials", { status: 401 });
    await assert.rejects(verifyUberDirectCredentials(), (error) => {
      assert.match(error.message, /rejected these credentials/);
      assert.doesNotMatch(error.message, /sensitive-secret/);
      return true;
    });
  });
});

test("Uber Direct quote uses the fixed kitchen pickup and returns a USD fee", async () => {
  await withCredentials({ UBER_DIRECT_CUSTOMER_ID: "customer", UBER_DIRECT_CLIENT_ID: "client", UBER_DIRECT_CLIENT_SECRET: "secret" }, async () => {
    globalThis.fetch = async (url, options) => {
      if (url === "https://auth.uber.com/oauth/v2/token") return Response.json({ access_token: "token", token_type: "Bearer", scope: "eats.deliveries" });
      assert.equal(url, "https://api.uber.com/v1/customers/customer/delivery_quotes");
      const payload = JSON.parse(options.body);
      const pickup = JSON.parse(payload.pickup_address);
      const dropoff = JSON.parse(payload.dropoff_address);
      assert.deepEqual(pickup.street_address, ["515 Broadway E"]);
      assert.equal(pickup.zip_code, "98102");
      assert.deepEqual(dropoff.street_address, ["123 Pine St", "Apt 4"]);
      return Response.json({ id: "dqt_test", fee: 558, currency: "usd", expires: "2026-11-14T01:15:00Z" });
    };
    const quote = await quoteUberDirect({ line1: "123 Pine St", line2: "Apt 4", city: "Seattle", state: "WA", postalCode: "98101" });
    assert.deepEqual(quote, { quoteId: "dqt_test", feeCents: 558, expires: "2026-11-14T01:15:00Z" });
  });
});
