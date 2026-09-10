import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getProduct } from "@/lib/products.functions";
import { formatKwd } from "@/lib/currency";
import { useCart } from "@/lib/cart";
import { StateCard, StockBadge } from "@/components/ui-bits";

const productQuery = (id: string) =>
  queryOptions({
    queryKey: ["product", id],
    queryFn: () => getProduct({ data: { id } }),
  });

export const Route = createFileRoute("/products/$id")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(productQuery(params.id)),
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Product not found — LabKit" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.name} — LabKit`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.description.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.description.slice(0, 155) },
      ],
    };
  },
  errorComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <StateCard
        tone="error"
        title="This product didn't load"
        description="Something went wrong fetching this item. Please refresh the page."
      />
    </div>
  ),
  component: ProductDetails,
});

function ProductDetails() {
  const { id } = Route.useParams();
  const { data: product } = useSuspenseQuery(productQuery(id));
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <StateCard
          title="Product not found"
          description="This item may have been removed from the catalogue."
          action={
            <Link
              to="/products"
              className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
            >
              Back to products
            </Link>
          }
        />
      </div>
    );
  }

  const soldOut = product.stock <= 0;
  const max = Math.max(product.stock, 1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link to="/products" className="hover:text-foreground">
          Products
        </Link>
        <span className="px-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
          <img
            src={product.image}
            alt={product.name}
            width={768}
            height={768}
            className="aspect-square w-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {product.category}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{product.name}</h1>
          <div className="mt-4 flex items-center gap-3">
            <span className="font-display text-3xl font-bold">{formatKwd(product.price)}</span>
            <StockBadge stock={product.stock} />
          </div>
          <p className="mt-5 leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center rounded-xl border border-border">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={soldOut || quantity <= 1}
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  className="h-11 w-11 text-lg font-semibold transition-colors hover:bg-muted disabled:opacity-40"
                >
                  −
                </button>
                <span className="w-12 text-center text-base font-semibold">{quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={soldOut || quantity >= max}
                  onClick={() => setQuantity((value) => Math.min(max, value + 1))}
                  className="h-11 w-11 text-lg font-semibold transition-colors hover:bg-muted disabled:opacity-40"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                disabled={soldOut}
                onClick={() => {
                  add(
                    {
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      stock: product.stock,
                    },
                    quantity,
                  );
                  setAdded(true);
                  window.setTimeout(() => setAdded(false), 1800);
                }}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
              >
                {soldOut ? "Out of stock" : added ? "Added to cart" : "Add to cart"}
              </button>
            </div>

            {added && (
              <Link
                to="/cart"
                className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
              >
                Go to cart →
              </Link>
            )}
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl border border-border bg-card p-4">
              <dt className="text-muted-foreground">Category</dt>
              <dd className="mt-1 font-semibold">{product.category}</dd>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <dt className="text-muted-foreground">Stock</dt>
              <dd className="mt-1 font-semibold">{product.stock} units</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
