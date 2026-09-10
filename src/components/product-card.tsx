import { Link } from "@tanstack/react-router";
import { useState } from "react";
import type { Product } from "@/lib/products.functions";
import { formatKwd } from "@/lib/currency";
import { useCart } from "@/lib/cart";
import { StockBadge } from "./ui-bits";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lift">
      <Link
        to="/products/$id"
        params={{ id: product.id }}
        className="block overflow-hidden bg-surface"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={768}
          height={768}
          className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {product.category}
        </p>
        <Link
          to="/products/$id"
          params={{ id: product.id }}
          className="font-display text-base font-semibold leading-snug transition-colors hover:text-primary"
        >
          {product.name}
        </Link>
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-display text-lg font-bold">{formatKwd(product.price)}</span>
          <StockBadge stock={product.stock} />
        </div>

        <button
          type="button"
          disabled={soldOut}
          onClick={() => {
            add({
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              stock: product.stock,
            });
            setAdded(true);
            window.setTimeout(() => setAdded(false), 1600);
          }}
          className="mt-1 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          {soldOut ? "Out of stock" : added ? "Added to cart" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}
