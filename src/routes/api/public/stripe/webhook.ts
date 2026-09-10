import { createFileRoute } from "@tanstack/react-router";

type StripeEvent = {
  type: string;
  data: { object: Record<string, unknown> };
};

export const Route = createFileRoute("/api/public/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["STRIPE_WEBHOOK_SECRET"];
        if (!secret) {
          console.error("STRIPE_WEBHOOK_SECRET is not configured");
          return new Response("Webhook secret not configured", { status: 500 });
        }

        const payload = await request.text();
        const { verifyStripeSignature } = await import("@/lib/stripe.server");
        const valid = await verifyStripeSignature(
          payload,
          request.headers.get("stripe-signature"),
          secret,
        );
        if (!valid) return new Response("Invalid signature", { status: 401 });

        let event: StripeEvent;
        try {
          event = JSON.parse(payload) as StripeEvent;
        } catch {
          return new Response("Invalid payload", { status: 400 });
        }

        const session = event.data?.object ?? {};
        const orderId =
          (session["client_reference_id"] as string | undefined) ??
          ((session["metadata"] as Record<string, string> | undefined)?.["order_id"] ?? null);

        if (!orderId) return Response.json({ received: true });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        if (event.type === "checkout.session.completed" && session["payment_status"] === "paid") {
          await supabaseAdmin
            .from("orders")
            .update({ payment_status: "paid", order_status: "processing" })
            .eq("id", orderId);
        } else if (
          event.type === "checkout.session.expired" ||
          event.type === "checkout.session.async_payment_failed"
        ) {
          await supabaseAdmin
            .from("orders")
            .update({ payment_status: "failed", order_status: "cancelled" })
            .eq("id", orderId);
        }

        return Response.json({ received: true });
      },
    },
  },
});
