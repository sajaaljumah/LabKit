import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listProducts } from "@/lib/products.functions";
import { ProductCard } from "@/components/product-card";
import { StateCard } from "@/components/ui-bits";

const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: () => listProducts(),
});

type ProductSearch = { category?: string | undefined };

export const Route = createFileRoute("/products/")({
  validateSearch: (search: Record<string, unknown>): ProductSearch =>
    typeof search["category"] === "string" ? { category: search["category"] } : {},
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  head: () => ({
    meta: [
      { title: "All products — LabKit" },
      {
        name: "description",
        content:
          "Browse LabKit's catalogue of dev tools, electronics kits and student essentials. Filter by category, search, and see live stock in KWD.",
      },
      { property: "og:title", content: "All products — LabKit" },
      {
        property: "og:description",
        content: "Dev tools, electronics kits and student essentials, priced in KWD.",
      },
    ],
  }),
  errorComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <StateCard
        tone="error"
        title="Products didn't load"
        description="We couldn't reach the catalogue. Please refresh and try again."
      />
    </div>
  ),
  component: ProductsPage,
});

function ProductsPage() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [query, setQuery] = useState("");

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category))),
    [products],
  );

  const activeCategory = search.category;

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = !activeCategory || product.category === activeCategory;
      const matchesQuery =
        needle.length === 0 ||
        product.name.toLowerCase().includes(needle) ||
        product.description.toLowerCase().includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [products, activeCategory, query]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">All products</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {products.length} items for Computer Engineering and Computer Science students. Prices
          include everything — no surprises at checkout.
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate({ search: {} })}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              !activeCategory
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-primary/40 hover:text-primary"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => navigate({ search: { category } })}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === category
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-primary/40 hover:text-primary"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <label className="relative lg:w-72">
          <span className="sr-only">Search products</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products…"
            className="h-11 w-full rounded-xl border border-input bg-card px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30"
          />
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="mt-10">
          <StateCard
            title="No products match your search"
            description="Try a different keyword or clear the category filter."
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
