/**
 * Menu prices come in five shapes:
 *   "$12.99"            a fixed price
 *   "$11.85 – $13.55"   a range (en dash or hyphen), e.g. Chipotle entrees by protein and market
 *   "$6.99 / $10.49"    one price per size, e.g. a 6-inch and a footlong sub
 *   "+$0.75"            an add-on charge
 *   "Included"          a short word, e.g. "Included" or "Seasonal"
 * Anything else is rejected by the brand validator.
 */
export type ParsedPrice =
  | { kind: "fixed"; low: number; high: number; count?: number }
  | { kind: "addon"; amount: number }
  | { kind: "label"; text: string };

const AMOUNT = String.raw`\$(\d{1,4}(?:\.\d{2})?)`;
const FIXED_RE = new RegExp(`^${AMOUNT}$`);
const RANGE_RE = new RegExp(`^${AMOUNT}\\s*[–-]\\s*${AMOUNT}$`);
const SIZES_RE = new RegExp(`^${AMOUNT}(?:\\s*/\\s*${AMOUNT})+$`);
const ADDON_RE = new RegExp(`^\\+${AMOUNT}$`);
const LABEL_RE = /^[A-Za-z][A-Za-z ]{0,19}$/;

export function parsePrice(price: string): ParsedPrice | null {
  let m = FIXED_RE.exec(price);
  if (m) return { kind: "fixed", low: Number(m[1]), high: Number(m[1]) };
  m = RANGE_RE.exec(price);
  if (m && Number(m[1]) <= Number(m[2])) return { kind: "fixed", low: Number(m[1]), high: Number(m[2]) };
  if (SIZES_RE.test(price)) {
    const amounts = [...price.matchAll(/\$(\d{1,4}(?:\.\d{2})?)/g)].map((a) => Number(a[1]));
    return { kind: "fixed", low: Math.min(...amounts), high: Math.max(...amounts), count: amounts.length };
  }
  m = ADDON_RE.exec(price);
  if (m) return { kind: "addon", amount: Number(m[1]) };
  if (LABEL_RE.test(price)) return { kind: "label", text: price };
  return null;
}

const money = (n: number) => `$${n.toFixed(2)}`;

/** Price range for a menu section, e.g. "$3.99 - $12.99", or "Included to +$0.75" for a choose-a-protein list. */
export function sectionPriceRange(prices: string[]): string {
  const parsed = prices.map(parsePrice).filter((p): p is ParsedPrice => p !== null);
  const fixed = parsed.filter((p) => p.kind === "fixed");
  if (fixed.length) {
    const low = Math.min(...fixed.map((p) => p.low));
    const high = Math.max(...fixed.map((p) => p.high));
    return low === high ? money(low) : `${money(low)} - ${money(high)}`;
  }
  const addons = parsed.flatMap((p) => (p.kind === "addon" ? [p.amount] : []));
  const labels = parsed.flatMap((p) => (p.kind === "label" ? [p.text] : []));
  if (addons.length) {
    const low = Math.min(...addons);
    const high = Math.max(...addons);
    const addonText = low === high ? `+${money(low)}` : `+${money(low)} - +${money(high)}`;
    return labels.includes("Included") ? `Included to ${addonText}` : addonText;
  }
  return labels[0] ?? "";
}

/** schema.org offer for one menu price; labels like "Included" get none. */
export function priceOffer(price: string): Record<string, unknown> | undefined {
  const p = parsePrice(price);
  if (!p || p.kind === "label") return undefined;
  if (p.kind === "addon") return { "@type": "Offer", price: p.amount.toFixed(2), priceCurrency: "USD", description: "Add-on price" };
  if (p.low === p.high) return { "@type": "Offer", price: p.low.toFixed(2), priceCurrency: "USD" };
  return {
    "@type": "AggregateOffer",
    lowPrice: p.low.toFixed(2),
    highPrice: p.high.toFixed(2),
    priceCurrency: "USD",
    ...(p.count ? { offerCount: p.count } : {}),
  };
}
