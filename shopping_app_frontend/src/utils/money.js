/**
 * Format an amount (string/number) with currency.
 * Backend returns decimal-like strings (e.g. "19.99").
 * @param {string|number} amount
 * @param {string} currency
 */
export function formatMoney(amount, currency = "USD") {
  const num = typeof amount === "number" ? amount : Number(amount || 0);
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(num);
  } catch {
    return `${num.toFixed(2)} ${currency}`;
  }
}
