/** LabKit sells in Kuwaiti Dinar, which uses three decimal places. */
export function formatKwd(amount: number): string {
  return `${amount.toFixed(3)} KWD`;
}

/** Stripe expects the smallest currency unit (fils for KWD). */
export function toFils(amount: number): number {
  return Math.round(amount * 1000);
}
