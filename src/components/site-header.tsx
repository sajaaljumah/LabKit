import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";

function LabKitMark() {
  return (
    <span className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-card">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none">
          <path
            d="M9 3v6.2L4.6 17a3 3 0 0 0 2.6 4.5h9.6A3 3 0 0 0 19.4 17L15 9.2V3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M8 3h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M7 14h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
      <span className="font-display text-xl font-bold tracking-tight">
        Lab<span className="text-primary">Kit</span>
      </span>
    </span>
  );
}

export function SiteHeader() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" aria-label="LabKit home">
          <LabKitMark />
        </Link>

        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            activeProps={{ className: "text-foreground bg-muted" }}
          >
            Home
          </Link>
          <Link
            to="/products"
            className="rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            activeProps={{ className: "text-foreground bg-muted" }}
          >
            Products
          </Link>
          <Link
            to="/cart"
            className="relative ml-1 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 transition-colors hover:border-primary/40 hover:text-primary"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
              <path
                d="M3 4h2l2.4 10.4A2 2 0 0 0 9.35 16h7.5a2 2 0 0 0 1.95-1.55L20.5 7H6"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="20" r="1.4" fill="currentColor" />
              <circle cx="17" cy="20" r="1.4" fill="currentColor" />
            </svg>
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
