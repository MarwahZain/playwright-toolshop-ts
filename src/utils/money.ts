/** Amounts in cents, so totals are added without floating-point rounding errors. */
export const toCents = (amount: number): number => Math.round(amount * 100);
