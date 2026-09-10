import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-display text-lg font-bold">
              Lab<span className="text-primary">Kit</span>
            </p>
            <p className="mt-1 text-sm font-semibold text-primary">
              Built for Engineering Students
            </p>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Study, development and desk essentials for Computer Engineering and Computer Science
              students. Prices in Kuwaiti Dinar.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <Link to="/products" className="transition-colors hover:text-foreground">
              All products
            </Link>
            <Link to="/cart" className="transition-colors hover:text-foreground">
              Cart
            </Link>
            <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium">
              Stripe test mode
            </span>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground/70">By Saja Aljumah</p>
          <p className="text-xs text-muted-foreground/70">© {new Date().getFullYear()} LabKit</p>
        </div>
      </div>
    </footer>
  );
}
