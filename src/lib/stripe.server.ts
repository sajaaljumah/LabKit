/**
 * Minimal server-only Stripe REST client.
 * The secret key is read from the environment inside each call and never
 * leaves the server.
 */

const STRIPE_API = "https://api.stripe.com/v1";

function secretKey(): string {
  const key = process.env["STRIPE_TEST_API_KEY"]?.trim();
  if (!key) throw new Error("Stripe is not configured on the server.");
  return key;
}

/** Flattens nested objects/arrays into Stripe's form-encoded parameter style. */
function encode(params: unknown, prefix = "", target = new URLSearchParams()): URLSearchParams {
  if (params === null || params === undefined) return target;
  if (Array.isArray(params)) {
    params.forEach((value, index) => encode(value, `${prefix}[${index}]`, target));
    return target;
  }
  if (typeof params === "object") {
    for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
      encode(value, prefix ? `${prefix}[${key}]` : key, target);
    }
    return target;
  }
  target.append(prefix, String(params));
  return target;
}

async function stripeRequest<T>(
  path: string,
  options: { method: "GET" | "POST"; body?: unknown } = { method: "GET" },
): Promise<T> {
  const response = await fetch(`${STRIPE_API}${path}`, {
    method: options.method,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: options.body ? encode(options.body).toString() : null,
  });

  const payload = (await response.json()) as { error?: { message?: string } };
  if (!response.ok) {
    console.error("Stripe API error", response.status, payload?.error?.message);
    if (response.status === 401) {
      throw new Error("Payments are not available right now. Please try again later.");
    }
    throw new Error(payload?.error?.message ?? "Stripe request failed.");
  }
  return payload as T;
}

export type StripeCheckoutSession = {
  id: string;
  url: string | null;
  payment_status: string;
  status: string;
  amount_total: number | null;
  currency: string | null;
  client_reference_id: string | null;
  customer_email?: string | null;
  customer_details?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  metadata?: Record<string, string>;
};

export function createCheckoutSession(body: Record<string, unknown>) {
  return stripeRequest<StripeCheckoutSession>("/checkout/sessions", { method: "POST", body });
}

export function retrieveCheckoutSession(id: string) {
  return stripeRequest<StripeCheckoutSession>(
    `/checkout/sessions/${encodeURIComponent(id)}?expand[]=line_items`,
  );
}

/** Verifies a Stripe webhook signature header (t=...,v1=...) using Web Crypto. */
export async function verifyStripeSignature(
  payload: string,
  header: string | null,
  secret: string,
): Promise<boolean> {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((part) => {
      const [key, ...rest] = part.split("=");
      return [key?.trim() ?? "", rest.join("=")];
    }),
  ) as Record<string, string>;

  const timestamp = parts["t"];
  const signature = parts["v1"];
  if (!timestamp || !signature) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${payload}`),
  );
  const expected = Array.from(new Uint8Array(mac))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  if (expected.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i += 1) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}
