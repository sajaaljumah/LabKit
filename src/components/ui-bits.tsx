import type { ReactNode } from "react";

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-muted-foreground">
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary"
        aria-hidden="true"
      />
      {label}…
    </div>
  );
}

export function StateCard({
  title,
  description,
  tone = "muted",
  action,
}: {
  title: string;
  description?: string;
  tone?: "muted" | "error";
  action?: ReactNode;
}) {
  const toneClass =
    tone === "error"
      ? "border-destructive/30 bg-destructive/5 text-destructive"
      : "border-border bg-card text-foreground";

  return (
    <div className={`rounded-2xl border p-8 text-center shadow-card ${toneClass}`}>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
        Out of stock
      </span>
    );
  }
  if (stock <= 12) {
    return (
      <span className="inline-flex items-center rounded-full bg-warning/15 px-2.5 py-1 text-xs font-semibold text-warning-foreground">
        Only {stock} left
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
      In stock
    </span>
  );
}
