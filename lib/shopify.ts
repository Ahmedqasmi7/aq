/**
 * Minimal Shopify Storefront API adapter.
 *
 * Reads the storefront domain + public token from env vars. When both are
 * present AND the cart lines carry real `shopifyVariantId`s, `createShopifyCart`
 * creates a real cart and returns Shopify's hosted checkout URL. Otherwise the
 * caller (lib/commerce.ts) falls back to the local mock checkout — this file
 * never throws for "not configured", it just returns `null`.
 */

const DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
const API_VERSION = "2024-10";

export function isShopifyConfigured(): boolean {
  return Boolean(DOMAIN && TOKEN);
}

type StorefrontLine = { merchandiseId: string; quantity: number };

type CartCreateResponse = {
  data?: {
    cartCreate?: {
      cart?: { id: string; checkoutUrl: string } | null;
      userErrors?: { field: string[]; message: string }[];
    };
  };
  errors?: { message: string }[];
};

const CART_CREATE_MUTATION = /* GraphQL */ `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Creates a Shopify cart and returns the hosted checkout URL, or `null` if
 * Shopify isn't configured, no lines carry a real Shopify variant ID, or the
 * request fails — any of which should trigger the mock-checkout fallback.
 */
export async function createShopifyCart(
  lines: StorefrontLine[]
): Promise<{ checkoutUrl: string } | null> {
  if (!isShopifyConfigured() || lines.length === 0) return null;

  try {
    const res = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": TOKEN as string,
      },
      body: JSON.stringify({ query: CART_CREATE_MUTATION, variables: { lines } }),
      cache: "no-store",
    });

    if (!res.ok) return null;
    const json = (await res.json()) as CartCreateResponse;
    const cart = json.data?.cartCreate?.cart;
    const userErrors = json.data?.cartCreate?.userErrors;

    if (!cart || (userErrors && userErrors.length > 0) || json.errors?.length) {
      return null;
    }

    return { checkoutUrl: cart.checkoutUrl };
  } catch {
    return null;
  }
}
