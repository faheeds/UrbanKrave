import { timingSafeEqual } from "node:crypto";

function equal(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function kitchenAuthorized(request: Request) {
  const user = process.env.KITCHEN_USER;
  const password = process.env.KITCHEN_PASSWORD;
  if (!user || !password) return false;
  const authorization = request.headers.get("authorization") || "";
  let entered = "";
  try { if (authorization.startsWith("Basic ")) entered = Buffer.from(authorization.slice(6), "base64").toString("utf8"); } catch { return false; }
  const separator = entered.indexOf(":");
  if (separator < 0) return false;
  return equal(entered.slice(0, separator), user) && equal(entered.slice(separator + 1), password);
}
