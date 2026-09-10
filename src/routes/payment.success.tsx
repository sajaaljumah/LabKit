import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { confirmCheckout } from "@/lib/orders.functions";
import { formatKwd } from "@/lib/currency";
import { useCart } from "@/lib/cart";
import { Spinner, StateCard } from "@/components/ui-bits";

type SuccessSearch = { session_id?: string | undefined };

export const Route = createFileRoute("/payment/success")({
  validateSearch: (search: Record<string, unknown>): SuccessSearch =>
    typeof search["session_id"] === "string" ? { session_id: search["session_id"] } : {},
  head: () => ({
    meta: [
      { title: "Payment successful — LabKit" },
      { name: "description", content: "Your LabKit order has been paid and confirmed." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Payment successful — LabKit" },
      { property: "og:description", content: "Your LabKit order has been paid and confirmed." },
    ],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { session_id: sessionId } = Route.useSearch();
  const confirm = useServerFn(confirmCheckout);
  const { clear } = useCart();

  const { data, isPending, isError } = useQuery({
    queryKey: ["order-confirmation", sessionId],
    enabled: Boolean(sessionId),
    retry: 1,
    queryFn: () => confirm({ data: { sessionId: sessionId! } }),
  });

  useEffect(() => {
    if (data?.payment_status === "paid") clear();
  }, [data?.payment_status, clear]);

  if (!sessionId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <StateCard
          title="No payment to confirm"
          description="This page is shown after a Stripe payment completes."
          action={
            <Link
              to="/products"
              className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
            >
              Continue shopping
            </Link>
          }
        />
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Spinner label="Confirming your payment" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <StateCard
          tone="error"
          title="We couldn't confirm this payment"
          description="If money left your account, your order is still recorded — refresh this page in a moment."
          action={
            <Link
              to="/cart"
              className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-semibold"
            >
              Back to cart
            </Link>
          }
        />
      </div>
    );
  }

  const paid = data.payment_status === "paid";

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-lift">
        <div
          className={`grid h-14 w-14 place-items-center rounded-2xl ${
            paid ? "bg-success/10 text-success" : "bg-warning/15 text-warning-foreground"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
            <path
              d={paid ? "M5 12.5l4.5 4.5L19 7" : "M12 8v5m0 3.5h.01"}
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="mt-5 font-display text-3xl font-bold">
          {paid ? "Payment successful" : "Payment is still processing"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {paid
            ? `Thanks ${data.customer_name}. A confirmation was sent to ${data.customer_email}.`
            : "Stripe hasn't confirmed this payment yet. Your order is saved and will update automatically."}
        </p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-4">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Order number</dt>
            <dd className="mt-1 font-mono text-sm font-semibold">{data.order_number}</dd>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Status</dt>
            <dd className="mt-1 text-sm font-semibold capitalize">{data.payment_status}</dd>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Total paid</dt>
            <dd className="mt-1 text-sm font-semibold">{formatKwd(data.total)}</dd>
          </div>
        </dl>

        <h2 className="mt-8 font-display text-lg font-semibold">Order summary</h2>
        <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
          {data.items.map((item) => (
            <li key={item.product_id} className="flex items-center gap-3 p-3">
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                width={768}
                height={768}
                className="h-12 w-12 rounded-lg border border-border object-cover"
              />
              <div className="flex-1 text-sm">
                <p className="font-medium">{item.name}</p>
                <p className="text-muted-foreground">Qty {item.quantity}</p>
              </div>
              <span className="text-sm font-semibold">
                {formatKwd(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <span className="font-semibold">Total</span>
          <span className="font-display text-xl font-bold">{formatKwd(data.total)}</span>
        </div>

        <Link
          to="/products"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
