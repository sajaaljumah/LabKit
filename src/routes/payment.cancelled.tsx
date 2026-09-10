import { createFileRoute, Link } from "@tanstack/react-router";

type CancelledSearch = { order?: string | undefined };

export const Route = createFileRoute("/payment/cancelled")({
  validateSearch: (search: Record<string, unknown>): CancelledSearch =>
    typeof search["order"] === "string" ? { order: search["order"] } : {},
  head: () => ({
    meta: [
      { title: "Payment cancelled — LabKit" },
      { name: "description", content: "Your LabKit payment was cancelled and nothing was charged." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Payment cancelled — LabKit" },
      { property: "og:description", content: "Nothing was charged. Your cart is still saved." },
    ],
  }),
  component: CancelledPage,
});

function CancelledPage() {
  const { order } = Route.useSearch();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-card">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-warning/15 text-warning-foreground">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
            <path
              d="M7 7l10 10M17 7L7 17"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h1 className="mt-5 font-display text-3xl font-bold">Payment cancelled</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          You left Stripe Checkout before the payment went through, so nothing was charged.
          {order ? ` Order ${order} is saved as unpaid.` : ""} Your cart is still here whenever
          you're ready.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            to="/checkout"
            className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Return to checkout
          </Link>
          <Link
            to="/cart"
            className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-semibold transition-colors hover:border-primary/40 hover:text-primary"
          >
            Review cart
          </Link>
        </div>
      </div>
    </div>
  );
}
