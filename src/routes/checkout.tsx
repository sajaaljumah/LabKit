import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { useCart } from "@/lib/cart";
import { formatKwd } from "@/lib/currency";
import { createCheckoutSessionForCart } from "@/lib/orders.functions";
import { Spinner, StateCard } from "@/components/ui-bits";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — LabKit" },
      {
        name: "description",
        content:
          "Enter your delivery details and pay securely with Stripe. LabKit runs in Stripe test mode.",
      },
      { property: "og:title", content: "Checkout — LabKit" },
      { property: "og:description", content: "Enter your details and pay securely with Stripe." },
    ],
  }),
  component: CheckoutPage,
});

const FIELDS = [
  { name: "fullName", label: "Full name", type: "text", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
  { name: "address", label: "Address", type: "text", autoComplete: "street-address" },
  { name: "city", label: "City", type: "text", autoComplete: "address-level2" },
  { name: "country", label: "Country", type: "text", autoComplete: "country-name" },
] as const;

function CheckoutPage() {
  const { items, ready, subtotal } = useCart();
  const startCheckout = useServerFn(createCheckoutSessionForCart);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Kuwait",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await startCheckout({
        data: {
          customer: form,
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
          })),
          origin: window.location.origin,
        },
      });
      window.location.href = result.url;
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "We couldn't start the payment. Please try again.",
      );
      setSubmitting(false);
    }
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Spinner label="Preparing checkout" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <StateCard
          title="There's nothing to check out"
          description="Your cart is empty, so there is no order to pay for yet."
          action={
            <Link
              to="/products"
              className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
            >
              Browse products
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Checkout</h1>
      <p className="mt-2 text-muted-foreground">
        Payment is handled on Stripe's secure page. This store runs in Stripe test mode — use card
        4242 4242 4242 4242 with any future date and CVC.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <h2 className="font-display text-lg font-semibold">Delivery details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <label
                key={field.name}
                className={field.name === "address" ? "sm:col-span-2" : undefined}
              >
                <span className="text-sm font-medium">{field.label}</span>
                <input
                  required
                  type={field.type}
                  autoComplete={field.autoComplete}
                  value={form[field.name]}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, [field.name]: event.target.value }))
                  }
                  className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30"
                />
              </label>
            ))}
          </div>

          {error && (
            <p className="mt-5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {submitting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
            )}
            {submitting ? "Redirecting to Stripe…" : "Pay with Stripe"}
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            You'll be redirected to Stripe Checkout to complete the payment.
          </p>
        </form>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold">Order summary</h2>
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  width={768}
                  height={768}
                  className="h-12 w-12 rounded-lg border border-border object-cover"
                />
                <div className="flex-1 text-sm">
                  <p className="font-medium leading-tight">{item.name}</p>
                  <p className="text-muted-foreground">Qty {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold">
                  {formatKwd(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-3 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-semibold">{formatKwd(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-display text-lg font-bold">{formatKwd(subtotal)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
