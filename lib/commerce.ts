import { PRODUCTS, getProductById } from "./products";
import { createShopifyCart, isShopifyConfigured } from "./shopify";
import type { AnalyticsEvent, CartLine, CartLineResolved, Product, ProductVariant } from "./types";

export type { Product, ProductVariant, Bundle, CartLine, CartLineResolved } from "./types";
export {
  PRODUCTS,
  BUNDLES,
  BUNDLE_PRODUCTS,
  getProductById,
  getProductByHandle,
  getBundleByHandle,
} from "./products";

export function findVariant(product: Product, variantId: string): ProductVariant | undefined {
  return product.variants.find((v) => v.id === variantId);
}

export function resolveCartLines(lines: CartLine[]): CartLineResolved[] {
  const resolved: CartLineResolved[] = [];
  for (const line of lines) {
    const product = getProductById(line.productId);
    if (!product) continue;
    const variant = findVariant(product, line.variantId);
    if (!variant) continue;
    resolved.push({ ...line, product, variant });
  }
  return resolved;
}

export function cartSubtotal(lines: CartLineResolved[]): number {
  return lines.reduce((sum, l) => sum + l.variant.price * l.quantity, 0);
}

export function cartItemCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}

/** Flat, static discount table for the on-brand cart discount field. Wire to a real promo engine later. */
const DISCOUNT_CODES: Record<string, number> = {
  VELARIO10: 0.1,
  ARCHIVE15: 0.15,
};

export function applyDiscountCode(code: string, subtotal: number): { valid: boolean; amount: number } {
  const pct = DISCOUNT_CODES[code.trim().toUpperCase()];
  if (!pct) return { valid: false, amount: 0 };
  return { valid: true, amount: Math.round(subtotal * pct * 100) / 100 };
}

export type CheckoutResult =
  | { mode: "shopify"; url: string }
  | { mode: "mock"; orderId: string; total: number };

/**
 * Attempts a real Shopify hosted checkout first (requires env vars + real
 * `shopifyVariantId`s on every line); falls back to the mock flow otherwise.
 * The caller doesn't need to know which path ran — it just follows `result`.
 */
export async function checkout(lines: CartLineResolved[]): Promise<CheckoutResult> {
  trackEvent({ name: "begin_checkout", value: cartSubtotal(lines), itemCount: cartItemCount(lines) });

  if (isShopifyConfigured() && lines.every((l) => l.variant.shopifyVariantId)) {
    const storefrontLines = lines.map((l) => ({
      merchandiseId: l.variant.shopifyVariantId as string,
      quantity: l.quantity,
    }));
    const cart = await createShopifyCart(storefrontLines);
    if (cart) return { mode: "shopify", url: cart.checkoutUrl };
  }

  const orderId = `VEL-${Date.now().toString(36).toUpperCase()}`;
  return { mode: "mock", orderId, total: cartSubtotal(lines) };
}

/**
 * Single analytics seam. Every commerce interaction funnels through here so
 * wiring a real provider (GA4, Klaviyo, Meta CAPI, etc.) later is a one-file
 * change.
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
    console.debug("[velario:analytics]", event);
  }
  // TODO: forward to a real analytics/CDP provider.
}

export function crossSellFor(productId: string, limit = 2): Product[] {
  return PRODUCTS.filter((p) => p.id !== productId).slice(0, limit);
}
