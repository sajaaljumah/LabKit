import { createServerFn } from "@tanstack/react-start";
import { toFils } from "./currency";

export type OrderItem = {
  product_id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

export type OrderSummary = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  currency: string;
  payment_status: string;
  order_status: string;
  created_at: string;
};

type CheckoutInput = {
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
  };
  items: {
    id: string;
    name?: string;
    price?: number;
    image?: string;
    quantity: number;
  }[];
  origin: string;
};

function requireText(value: unknown, field: string, max = 200): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} is required.`);
  }
  if (value.trim().length > max) throw new Error(`${field} is too long.`);
  return value.trim();
}

function makeOrderNumber(): string {
  const random = Math.floor(Math.random() * 46656)
    .toString(36)
    .toUpperCase()
    .padStart(3, "0");
  return `LK-${Date.now().toString(36).toUpperCase().slice(-5)}${random}`;
}

/**
 * Creates a Stripe Checkout session directly from the cart items.
 * Decoupled from Supabase service-role key for standalone test-mode payments.
 */
export const createCheckoutSessionForCart = createServerFn({ method: "POST" })
  .inputValidator((data: CheckoutInput) => {
    if (!Array.isArray(data?.items) || data.items.length === 0) {
      throw new Error("Your cart is empty.");
    }
    const items = data.items.map((item) => {
      if (typeof item?.id !== "string") throw new Error("Invalid cart item.");
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        throw new Error("Invalid quantity in cart.");
      }
      return {
        id: item.id,
        name: typeof item.name === "string" ? item.name : undefined,
        price: typeof item.price === "number" ? item.price : undefined,
        image: typeof item.image === "string" ? item.image : undefined,
        quantity,
      };
    });
    return {
      items,
      origin: requireText(data.origin, "Origin", 300),
      customer: {
        fullName: requireText(data.customer?.fullName, "Full name"),
        email: requireText(data.customer?.email, "Email"),
        phone: requireText(data.customer?.phone, "Phone"),
        address: requireText(data.customer?.address, "Address", 400),
        city: requireText(data.customer?.city, "City"),
        country: requireText(data.customer?.country, "Country"),
      },
    } satisfies CheckoutInput;
  })
  .handler(async ({ data }) => {
    const { createCheckoutSession } = await import("./stripe.server");

    // Attempt to verify product prices against the public Supabase products table if accessible
    const productsMap = new Map<
      string,
      { id: string; name: string; price: number; image: string; stock: number }
    >();

    try {
      const url = process.env["SUPABASE_URL"];
      const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
      if (url && key) {
        const { createClient } = await import("@supabase/supabase-js");
        const client = createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: dbProducts } = await client
          .from("products")
          .select("id, name, price, image, stock")
          .in(
            "id",
            data.items.map((i) => i.id),
          );
        if (dbProducts) {
          for (const p of dbProducts) {
            productsMap.set(p.id, {
              id: p.id,
              name: p.name,
              price: Number(p.price),
              image: p.image,
              stock: p.stock,
            });
          }
        }
      }
    } catch {
      // Fallback to cart-provided prices if Supabase public endpoint is unreachable
    }

    const orderItems: OrderItem[] = data.items.map((item) => {
      const dbProduct = productsMap.get(item.id);
      return {
        product_id: item.id,
        name: dbProduct?.name ?? item.name ?? "LabKit Product",
        image: dbProduct?.image ?? item.image ?? "/placeholder.svg",
        price: dbProduct?.price ?? item.price ?? 0,
        quantity: item.quantity,
      };
    });

    const subtotal = Number(
      orderItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(3),
    );

    const orderNumber = makeOrderNumber();
    const origin = data.origin.replace(/\/$/, "");

    // Compact item representation for Stripe metadata (500 char limit)
    const compactItems = orderItems.map((i) => ({
      id: i.product_id,
      n: i.name.slice(0, 30),
      p: i.price,
      q: i.quantity,
      img: i.image,
    }));

    const session = await createCheckoutSession({
      mode: "payment",
      client_reference_id: orderNumber,
      customer_email: data.customer.email,
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment/cancelled?order=${orderNumber}`,
      metadata: {
        order_number: orderNumber,
        customer_name: data.customer.fullName,
        customer_email: data.customer.email,
        customer_phone: data.customer.phone,
        address: data.customer.address,
        city: data.customer.city,
        country: data.customer.country,
        subtotal: subtotal.toFixed(3),
        total: subtotal.toFixed(3),
        items: JSON.stringify(compactItems).slice(0, 500),
      },
      line_items: orderItems.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "kwd",
          unit_amount: toFils(item.price),
          product_data: {
            name: item.name,
          },
        },
      })),
    });

    if (!session.url) throw new Error("Stripe did not return a checkout page.");

    return { url: session.url, orderNumber };
  });

/** Reads the Stripe session directly from Stripe and verifies the payment status. */
export const confirmCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: { sessionId: string }) => ({
    sessionId: requireText(data?.sessionId, "Session id", 300),
  }))
  .handler(async ({ data }): Promise<OrderSummary | null> => {
    const { retrieveCheckoutSession } = await import("./stripe.server");

    const session = await retrieveCheckoutSession(data.sessionId);
    if (!session) return null;

    const meta = session.metadata ?? {};
    const orderNumber =
      session.client_reference_id ||
      meta["order_number"] ||
      `LK-${session.id.slice(-6).toUpperCase()}`;

    const customerName =
      session.customer_details?.name ||
      meta["customer_name"] ||
      "Customer";

    const customerEmail =
      session.customer_details?.email ||
      session.customer_email ||
      meta["customer_email"] ||
      "";

    let items: OrderItem[] = [];
    if (meta["items"]) {
      try {
        const parsed = JSON.parse(meta["items"]);
        if (Array.isArray(parsed)) {
          items = parsed.map((p: any) => ({
            product_id: String(p.id ?? ""),
            name: String(p.n ?? p.name ?? "LabKit Product"),
            image: String(p.img ?? p.image ?? "/placeholder.svg"),
            price: Number(p.p ?? p.price ?? 0),
            quantity: Number(p.q ?? p.quantity ?? 1),
          }));
        }
      } catch {
        // Fallback if metadata items JSON was truncated or malformed
      }
    }

    // If metadata items were truncated or empty, fallback to a line summary
    const total =
      session.amount_total != null
        ? session.amount_total / 1000
        : Number(meta["total"] ?? 0);

    const subtotal = meta["subtotal"] ? Number(meta["subtotal"]) : total;

    if (items.length === 0 && total > 0) {
      items = [
        {
          product_id: "order-total",
          name: "LabKit Order",
          image: "/placeholder.svg",
          price: total,
          quantity: 1,
        },
      ];
    }

    return {
      id: session.id,
      order_number: orderNumber,
      customer_name: customerName,
      customer_email: customerEmail,
      items,
      subtotal,
      total,
      currency: (session.currency ?? "KWD").toUpperCase(),
      payment_status: session.payment_status,
      order_status: session.payment_status === "paid" ? "processing" : "pending",
      created_at: new Date().toISOString(),
    };
  });

/** Looks an order up by its human-readable number (used by the cancelled page). */
export const getOrderByNumber = createServerFn({ method: "GET" })
  .inputValidator((data: { orderNumber: string }) => ({
    orderNumber: requireText(data?.orderNumber, "Order number", 40),
  }))
  .handler(async ({ data }): Promise<OrderSummary | null> => {
    return {
      id: data.orderNumber,
      order_number: data.orderNumber,
      customer_name: "",
      customer_email: "",
      items: [],
      subtotal: 0,
      total: 0,
      currency: "KWD",
      payment_status: "unpaid",
      order_status: "cancelled",
      created_at: new Date().toISOString(),
    };
  });
