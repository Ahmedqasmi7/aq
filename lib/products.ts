import type { Bundle, Product } from "./types";

/**
 * Product catalog. Prices sit deliberately below the $300+ traditional-luxury
 * bracket — VELARIO competes on value arbitrage, not sticker price.
 * Populate `shopifyProductId` / `shopifyVariantId` and the env vars documented
 * in the README to make this a live Shopify catalog; until then the site runs
 * on this data with a local mock checkout.
 */
export const PRODUCTS: Product[] = [
  {
    id: "santal-noir",
    handle: "santal-noir",
    name: "Santal Noir",
    tagline: "Smoked sandalwood, wrapped in midnight amber.",
    description:
      "A brutalist gourmand built around aged Mysore-style sandalwood, warmed by smoked amber and a whisper of black pepper. Santal Noir is the signature architecture of the house — cold to open, incendiary by the base.",
    accentHex: "#C5A059",
    notes: [
      { name: "Bergamot", tier: "top" },
      { name: "Black Pepper", tier: "top" },
      { name: "Midnight Orchid", tier: "heart" },
      { name: "Sandalwood", tier: "heart" },
      { name: "Smoked Amber", tier: "base" },
      { name: "Vetiver", tier: "base" },
    ],
    images: [
      { src: "/images/products/santal-noir-01.svg", alt: "Santal Noir flacon on obsidian" },
      { src: "/images/products/santal-noir-02.svg", alt: "Santal Noir detail, gold cap" },
    ],
    variants: [
      { id: "santal-noir-50", label: "50ml", sizeMl: 50, price: 185, sku: "VEL-SN-50", inventory: "in-stock" },
      { id: "santal-noir-100", label: "100ml", sizeMl: 100, price: 245, compareAtPrice: 275, sku: "VEL-SN-100", inventory: "in-stock" },
      { id: "santal-noir-15", label: "15ml Travel", sizeMl: 15, price: 85, sku: "VEL-SN-15", inventory: "low-stock" },
    ],
  },
  {
    id: "nocturne",
    handle: "nocturne",
    name: "Nocturne",
    tagline: "A rose that only blooms after dark.",
    description:
      "Nocturne pairs a bruised, narcotic rose with cold fig and a base of smoked vetiver. Built for the hour between dusk and dinner — sharp on entry, devastating on skin.",
    accentHex: "#E6C588",
    notes: [
      { name: "Fig", tier: "top" },
      { name: "Pink Pepper", tier: "top" },
      { name: "Rose", tier: "heart" },
      { name: "Midnight Orchid", tier: "heart" },
      { name: "Vetiver", tier: "base" },
      { name: "Ambergris", tier: "base" },
    ],
    images: [
      { src: "/images/products/nocturne-01.svg", alt: "Nocturne flacon on obsidian" },
      { src: "/images/products/nocturne-02.svg", alt: "Nocturne detail, gold cap" },
    ],
    variants: [
      { id: "nocturne-50", label: "50ml", sizeMl: 50, price: 195, sku: "VEL-NC-50", inventory: "in-stock" },
      { id: "nocturne-100", label: "100ml", sizeMl: 100, price: 255, compareAtPrice: 290, sku: "VEL-NC-100", inventory: "in-stock" },
      { id: "nocturne-15", label: "15ml Travel", sizeMl: 15, price: 89, sku: "VEL-NC-15", inventory: "in-stock" },
    ],
  },
  {
    id: "aether-bloom",
    handle: "aether-bloom",
    name: "Aether Bloom",
    tagline: "Bergamot light, held in place by white amber.",
    description:
      "The house's brightest composition: cold-pressed bergamot and a green fig accord, settling into a soft, sun-warmed amber base. Aether Bloom is VELARIO worn in daylight.",
    accentHex: "#F5F4F0",
    notes: [
      { name: "Bergamot", tier: "top" },
      { name: "Fig", tier: "top" },
      { name: "White Tea", tier: "heart" },
      { name: "Rose", tier: "heart" },
      { name: "White Amber", tier: "base" },
      { name: "Musk", tier: "base" },
    ],
    images: [
      { src: "/images/products/aether-bloom-01.svg", alt: "Aether Bloom flacon on obsidian" },
      { src: "/images/products/aether-bloom-02.svg", alt: "Aether Bloom detail, gold cap" },
    ],
    variants: [
      { id: "aether-bloom-50", label: "50ml", sizeMl: 50, price: 175, sku: "VEL-AB-50", inventory: "in-stock" },
      { id: "aether-bloom-100", label: "100ml", sizeMl: 100, price: 235, sku: "VEL-AB-100", inventory: "preorder" },
      { id: "aether-bloom-15", label: "15ml Travel", sizeMl: 15, price: 79, sku: "VEL-AB-15", inventory: "in-stock" },
    ],
  },
];

export const BUNDLES: Bundle[] = [
  {
    id: "the-discovery-set",
    handle: "discovery-set",
    name: "The Discovery Set",
    tagline: "All three signatures, travel-sized.",
    description:
      "Santal Noir, Nocturne, and Aether Bloom in 15ml flacons — the full architecture of the house, built for a first acquaintance or a carry-on.",
    productIds: ["santal-noir", "nocturne", "aether-bloom"],
    price: 195,
    compareAtPrice: 253,
    image: { src: "/images/bundles/discovery-set.svg", alt: "The Discovery Set, three travel flacons" },
  },
  {
    id: "the-archive-duo",
    handle: "archive-duo",
    name: "The Archive Duo",
    tagline: "Santal Noir & Nocturne, full size.",
    description:
      "The house's two darkest compositions, paired at full 50ml size for a wardrobe that runs from afternoon into night.",
    productIds: ["santal-noir", "nocturne"],
    price: 335,
    compareAtPrice: 380,
    image: { src: "/images/bundles/archive-duo.svg", alt: "The Archive Duo, two 50ml flacons" },
  },
  {
    id: "the-flagship-edition",
    handle: "flagship-edition",
    name: "The Flagship Edition",
    tagline: "All three, full size, archival box.",
    description:
      "The complete VELARIO wardrobe at 50ml, presented in the archival obsidian-and-gold box reserved for private clients.",
    productIds: ["santal-noir", "nocturne", "aether-bloom"],
    price: 495,
    compareAtPrice: 555,
    image: { src: "/images/bundles/flagship-edition.svg", alt: "The Flagship Edition, three 50ml flacons in an archival box" },
  },
];

/**
 * Bundles are also registered as single-variant products so the same cart
 * model (productId + variantId + quantity) can carry them at their real
 * bundle price — no separate "bundle line" concept needed anywhere else.
 */
export const BUNDLE_PRODUCTS: Product[] = BUNDLES.map((bundle) => ({
  id: `bundle-${bundle.id}`,
  handle: bundle.handle,
  name: bundle.name,
  tagline: bundle.tagline,
  description: bundle.description,
  accentHex: "#C5A059",
  notes: [],
  images: [bundle.image],
  variants: [
    {
      id: `bundle-${bundle.id}-default`,
      label: "Set",
      sizeMl: 0,
      price: bundle.price,
      compareAtPrice: bundle.compareAtPrice,
      sku: `VEL-${bundle.id.toUpperCase()}`,
      inventory: "in-stock",
    },
  ],
}));

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id) ?? BUNDLE_PRODUCTS.find((p) => p.id === id);
}

export function getProductByHandle(handle: string): Product | undefined {
  return PRODUCTS.find((p) => p.handle === handle);
}

export function getBundleByHandle(handle: string): Bundle | undefined {
  return BUNDLES.find((b) => b.handle === handle);
}
