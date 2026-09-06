export type NoteTier = "top" | "heart" | "base";

export type ScentNote = {
  name: string;
  tier: NoteTier;
};

export type InventoryStatus = "in-stock" | "low-stock" | "sold-out" | "preorder";

export type ProductVariant = {
  id: string;
  label: string;
  sizeMl: number;
  price: number;
  compareAtPrice?: number;
  sku: string;
  inventory: InventoryStatus;
  /** gid://shopify/ProductVariant/... — set this to enable real Shopify checkout for this variant. */
  shopifyVariantId?: string;
};

export type ProductImage = {
  src: string;
  alt: string;
};

export type Product = {
  id: string;
  handle: string;
  name: string;
  tagline: string;
  description: string;
  accentHex: string;
  notes: ScentNote[];
  images: ProductImage[];
  variants: ProductVariant[];
  /** gid://shopify/Product/... */
  shopifyProductId?: string;
};

export type Bundle = {
  id: string;
  handle: string;
  name: string;
  tagline: string;
  description: string;
  productIds: string[];
  price: number;
  compareAtPrice?: number;
  image: ProductImage;
};

export type CartLine = {
  variantId: string;
  productId: string;
  quantity: number;
};

export type CartLineResolved = CartLine & {
  product: Product;
  variant: ProductVariant;
};

export type AnalyticsEvent =
  | { name: "view_item"; productId: string }
  | { name: "add_to_cart"; productId: string; variantId: string; quantity: number }
  | { name: "begin_checkout"; value: number; itemCount: number }
  | { name: "remove_from_cart"; productId: string; variantId: string };
