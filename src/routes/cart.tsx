import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { formatKwd } from "@/lib/currency";
import { Spinner, StateCard } from "@/components/ui-bits";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — LabKit" },
      {
        name: "description",
        content: "Review the LabKit items in your cart, adjust quantities and continue to checkout.",
      },
      { property: "og:title", content: "Your cart — LabKit" },
      { property: "og:description", content: "Review your LabKit items and continue to checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, ready, subtotal, setQuantity, remove } = useCart();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Your cart</h1>

      {!ready ? (
        <Spinner label="Loading your cart" />
      ) : items.length === 0 ? (
        <div className="mt-8">
          <StateCard
            title="Your cart is empty"
            description="Add some gear from the catalogue and it will show up here."
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
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <ul className="space-y-4">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-card"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  width={768}
                  height={768}
                  className="h-24 w-24 shrink-0 rounded-xl border border-border object-cover"
                />
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to="/products/$id"
                      params={{ id: item.id }}
                      className="font-display font-semibold hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="text-sm text-muted-foreground transition-colors hover:text-destructive"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatKwd(item.price)} each
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="inline-flex items-center rounded-xl border border-border">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${item.name}`}
                        onClick={() => setQuantity(item.id, item.quantity - 1)}
                        className="h-9 w-9 font-semibold transition-colors hover:bg-muted"
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${item.name}`}
                        disabled={item.quantity >= item.stock}
                        onClick={() => setQuantity(item.id, item.quantity + 1)}
                        className="h-9 w-9 font-semibold transition-colors hover:bg-muted disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-display font-bold">
                      {formatKwd(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold">Order summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-semibold">{formatKwd(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd className="font-semibold text-success">Free</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base">
                <dt className="font-semibold">Total</dt>
                <dd className="font-display text-lg font-bold">{formatKwd(subtotal)}</dd>
              </div>
            </dl>
            <Link
              to="/checkout"
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Proceed to checkout
            </Link>
            <Link
              to="/products"
              className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl border border-border text-sm font-semibold transition-colors hover:border-primary/40 hover:text-primary"
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
