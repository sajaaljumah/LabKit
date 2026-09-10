import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listProducts } from "@/lib/products.functions";
import { ProductCard } from "@/components/product-card";
import { StateCard } from "@/components/ui-bits";

const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: () => listProducts(),
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  head: () => ({
    meta: [
      { title: "LabKit — Gear for Engineering & CS Students" },
      {
        name: "description",
        content:
          "LabKit is an online store for Computer Engineering and CS students: dev tools, electronics kits and desk essentials, priced in KWD.",
      },
      { property: "og:title", content: "LabKit — Gear for Engineering & CS Students" },
      {
        property: "og:description",
        content:
          "Dev tools, electronics kits and desk essentials for engineering and computer science students.",
      },
    ],
  }),
  errorComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <StateCard
        tone="error"
        title="The store didn't load"
        description="We couldn't reach the product catalogue. Please refresh the page."
      />
    </div>
  ),
  component: Home,
});

const CATEGORY_BLURBS: Record<string, string> = {
  "Essential Tools": "Hubs, drives, cables and peripherals that keep your setup running.",
  "Electronics & Development": "Boards, kits and components for embedded and IoT coursework.",
  "Student Essentials": "Desk, note-taking and carry gear for long study days.",
};

function Home() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const featured = products.filter((product) => product.stock > 0).slice(0, 4);
  const categories = Array.from(new Set(products.map((product) => product.category)));

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div className="surface-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-primary">
              Built for Engineering Students
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              Everything your <span className="text-gradient">lab bench</span> and desk are missing.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              LabKit brings the tools, boards and everyday essentials engineering and computer
              science students actually use — from USB-C hubs and SSDs to Arduino kits, sensors and
              desk lamps. One store, honest prices in KWD.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex h-12 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-card transition-opacity hover:opacity-90"
              >
                Browse products
              </Link>
              <a
                href="#categories"
                className="inline-flex h-12 items-center rounded-xl border border-border bg-card px-6 text-sm font-semibold transition-colors hover:border-primary/40 hover:text-primary"
              >
                See categories
              </a>
            </div>
          </div>

          <div className="relative">
            <img
              src="/images/labkit-hero.jpg"
              alt="An engineering student desk with a laptop, mechanical keyboard, breadboard and desk lamp"
              width={1536}
              height={1024}
              className="w-full rounded-3xl border border-border object-cover shadow-lift"
            />
          </div>
        </div>
      </section>

      <section id="categories" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Shop by category</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category}
              to="/products"
              search={{ category }}
              className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-lift"
            >
              <h3 className="font-display text-lg font-semibold group-hover:text-primary">
                {category}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {CATEGORY_BLURBS[category] ?? "Student-ready gear, ready to ship."}
              </p>
              <span className="mt-4 inline-block text-sm font-semibold text-primary">
                Browse →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Featured products</h2>
          <Link to="/products" className="text-sm font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>
        {featured.length === 0 ? (
          <div className="mt-6">
            <StateCard title="No products yet" description="The catalogue is currently empty." />
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
