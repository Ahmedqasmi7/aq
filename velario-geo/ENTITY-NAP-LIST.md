# Velario Fragrances — Entity Property List & NAP Audit

Prepared 2026-09-17. Nothing in this document has been submitted, created, or
claimed anywhere — per the brief's boundaries, account/profile creation is
explicitly out of scope for this agent. This is reference data for you (or
whoever creates these profiles) to use directly.

## NAP consistency audit — finding

Checked all four live policy pages (`/policies/privacy-policy`,
`/policies/terms-of-service`, `/policies/shipping-policy`,
`/policies/refund-policy`) for the business name/address/phone Velario
publishes. Result: **inconsistent, and incomplete on one page.**

| Page | Address as published |
|---|---|
| Shipping policy | 470 Adriatic Parkway, **Unit** 2229, McKinney, TX 75072, United States |
| Privacy policy | 470 Adriatic Parkway, **Suite** 2229, McKinney, TX 75072, United States |
| Refund policy | 470 Adriatic Parkway, **Unit** 2229, McKinney, TX 75072, United States |
| Terms of service | **No business name, address, or contact section found at all** |

"Unit" vs "Suite" is a small inconsistency but genuinely hurts entity
resolution for local/business-profile signals — search and AI engines cross-
check NAP across sources, and mismatched unit designators are a common
cause of unmerged or lower-confidence entity records. The missing contact
block on Terms of Service is the bigger gap.

**Fix needed:** standardize on one designator (recommend "Unit 2229", the
majority form) across all three pages that have it, and add the same
contact block to Terms of Service. This lives under **Shopify Admin >
Settings > Policies**, which this project's control boundaries gate —
requires your explicit approval and isn't something I've touched.

No phone number appears anywhere on the site (all four policy pages,
`agents.md`, and the theme settings) — support appears to be email-only via
hello@wearvelario.com. Treated as real (not missing data I failed to find)
unless you tell me otherwise.

## Verified entity properties

All values below were pulled directly from the live store (Shopify Admin
API `get-shop-info`, the four policy pages, and the rendered Organization
JSON-LD on the draft preview) — nothing here is invented.

| Property | Value | Source |
|---|---|---|
| Legal/display name | Velario Fragrances | Shopify Admin shop info |
| Website | https://wearvelario.com | Shopify Admin shop info |
| Support email | hello@wearvelario.com | Shopify Admin shop info; matches every policy page |
| Street address | 470 Adriatic Parkway, Unit 2229 | Shipping & refund policy pages (majority form — see inconsistency above) |
| City / State / ZIP | McKinney, TX 75072 | Shipping & refund policy pages |
| Country | United States | Shopify Admin shop info; policy pages |
| Phone | Not published anywhere found | — |
| Logo (resolved public URL) | https://wearvelario.com/cdn/shop/files/WhatsApp_Image_2026-01-28_at_08.59.13__1_-removebg-preview.png?v=1782594612&width=500 | Rendered from `settings.logo` on the draft preview |
| Primary category (suggested, not verified) | Perfume store / Cosmetics & fragrance retailer | My suggestion based on product catalog — pick whichever taxonomy each platform offers closest to this |
| Hours | Not applicable — online-only DTC, no public storefront | Inferred from site content; confirm before submitting anywhere that requires hours |
| Price range indicator (if a platform asks) | $49.99 single bottle; up to $199 for a 5-bottle bundle | Verified live pricing |
| Currency | USD | Shopify Admin shop info |
| Founded / other business details | Not found published anywhere on-site | — |
| Social profiles (sameAs candidates) | **None configured** | Checked `config/settings_data.json` theme settings directly — no Twitter/Instagram/TikTok/Facebook links are set anywhere in the theme. If Velario has real, active social accounts that just aren't wired into the theme, supply the URLs and I can add them to the Organization schema's `sameAs` (verified first) and to this list. |

## Per-platform notes

- **Google Business Profile** — typically for businesses with a physical
  location or a defined service area customers interact with directly.
  Velario is a pure e-commerce DTC brand; a GBP listing may not be the
  right fit unless you specifically want the McKinney address surfaced as
  a service-area business. Your call — flagging rather than assuming.
- **Bing Places** — same physical/service-area consideration as GBP.
- **Trustpilot** — straightforward fit for a DTC brand; would use the NAP
  above once standardized. Real review content already exists in Judge.me
  (13,758 reviews, 4.73 avg, verified against per-SKU metafields — see
  AUDIT.md) — Trustpilot doesn't import Judge.me reviews automatically, so
  this would start from zero reviews there regardless of Judge.me volume.
- **Wikidata** — a DTC fragrance brand with this profile (no independent
  press coverage found, no Wikipedia article) would very likely fail
  Wikidata's notability bar for a standalone item. Not recommended unless
  independent, reliable-source coverage exists that I haven't seen.

## What I did not do

I did not create, claim, sign up for, or submit anything to any of the
above platforms — that's explicitly forbidden by this project's control
boundaries without exception. This document exists so you (or whoever you
delegate account creation to) has accurate, sourced data to use.
