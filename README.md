# VELARIO Fragrance House

A production-ready, ultra-luxury fragrance e-commerce site: a real-time WebGL
cinematic scroll experience on the home page, five lighter but still-dynamic
content pages, and a working cart → checkout flow with a Shopify Storefront
API adapter (mock fallback included).

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Three.js /
React Three Fiber / Drei, GSAP + ScrollTrigger, Lenis smooth scroll, and
Zustand.

> Looking for the local AI agent (`aq-agent`)? It lives in [`agent/`](agent/README.md) — a
> standalone, offline-capable daemon that runs on Ollama with no API credits, unrelated to this
> Next.js site. See `agent/README.md` for setup.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build (Turbopack)
npm run start   # serve the production build
npm run lint    # ESLint (flat config)
npx tsc --noEmit  # typecheck
node scripts/smoke-test.mjs   # headless route + cart/form smoke test (needs a running server on :3100, or set SMOKE_BASE_URL)
```

Regenerating the procedural product/bundle/editorial art (see below):

```bash
node scripts/generate-product-art.mjs
```

## Routes

| Route | What it is |
| --- | --- |
| `/` | Home — the full cinematic scroll experience, Acts I–V |
| `/why-velario` | Brand manifesto / philosophy, editorial layout |
| `/about` | Founding story, timeline, team |
| `/bundle` | Gift sets + build-your-own configurator, real cart integration |
| `/business-inquiry` | Wholesale/corporate/private-label lead form |
| `/help` | FAQ (search/filter), shipping/returns/care, contact form |
| `/order-confirmation` | Post-checkout confirmation (mock-checkout destination) |
| `/api/business-inquiry` | Validates + logs a business inquiry submission |
| `not-found.tsx` | Custom on-brand 404 |
| `loading.tsx` / `error.tsx` | On-brand global loading + error states |

Every non-home route keeps the shared shell (nav, footer, custom cursor, cart
drawer — `components/shell/`) and uses `AmbientCanvas` for a lighter WebGL
accent (a drifting gold dust field + slow fog), except `/help`, which skips
WebGL entirely for a fast, content-first load and uses a pure-CSS animated
gradient instead — per the brief's "no WebGL dependency blocking content"
requirement. Both routes stay dynamic without WebGL: same mandate as everywhere
else, no static/dead frames.

## The Home Cinematic Experience

`components/home/HomeExperience.tsx` renders one `position: fixed`
`<Canvas>` behind five tall scroll sections (Acts I–V). A single GSAP
ScrollTrigger spans the whole scroll container and writes a 0→1 `progress`
value into a Zustand store (`store/scene-store.ts`) on every scroll tick —
read imperatively inside R3F `useFrame` callbacks (never via the React hook,
to keep 60fps updates off React's render cycle). `components/three/SceneRoot.tsx`
samples that progress against a single continuous camera path
(`cameraPath.ts`) and cross-fades each act's 3D group in and out via a
smoothstepped "window" function — there are no hard cuts or mounts/unmounts,
just continuous opacity/scale interpolation every frame.

- **Act I — The Awakening**: procedural amber shard (custom `LatheGeometry`
  + GLSL fresnel/fracture shader) on a dark, glossy "wet slate" ground plane,
  with an animated dewdrop. The "VELARIO" wordmark is built as real DOM
  typography with a live cursor-driven 3D perspective transform (not a
  WebGL mesh — see note on fonts below) and a letter-by-letter GSAP reveal.
- **Act II — The Monolith**: the procedural flacon (primitives + a custom
  anisotropic brushed-gold shader for the cap, `MeshPhysicalMaterial` for
  the obsidian glass, and a custom swirling fresnel "liquid" shader inside
  that reacts to live cursor position) in a fog chamber; the key light
  lerps from cold to warm as you scroll.
- **Act III — The Olfactory Descent**: instanced low-poly botanicals
  (extruded from a bezier `THREE.Shape` authored in code) drifting inside
  the fog/particle field, glassmorphism narration panels that cross-fade
  through three harvesting-ritual vignettes, and an editorial lookbook grid
  (real generated SVG compositions) — the 3D motion keeps running behind
  and around the grid rather than cutting to a static frame.
- **Act IV — The Alchemical Climax**: the flacon's six notes (top: Bergamot,
  Fig; heart: Midnight Orchid, Rose; base: Smoked Amber, Vetiver) as
  hoverable 3D markers with `drei`'s `Html` for the typographic data cards;
  hovering tightens the `DepthOfField` bokeh toward that note.
  Renders once but drives its DOM/material opacity from a `useFrame`
  callback rather than re-rendering, so the parent group's per-frame fade
  doesn't fight it (see the comment in `NoteMarkers.tsx`).
- **Act V — Acquisition**: the three real product variants (Santal Noir,
  Nocturne, Aether Bloom), each with a working variant selector, quantity
  stepper, stock-status copy, a magnetic-hover "Acquire Flacon" CTA wired to
  the real cart store, and a "View Bag" shortcut into the cart drawer.

All shared 3D building blocks (shard, flacon, botanicals, fog, particle
dust, ground) live in `components/three/` and are reused by the lighter
`AmbientCanvas` on every secondary page.

### Procedural, no external assets

Per the brief, **nothing in this build fetches external 3D models, HDRIs,
or texture files.** Every geometry is built from primitives or custom
`BufferGeometry`/`LatheGeometry`/`ExtrudeGeometry`; every texture (noise,
particle sprite) is generated at runtime onto an offscreen `<canvas>`
(`components/three/textures.ts`); every shader is hand-written GLSL.

## Photography / Graphic Art — Real vs. Generated

There is no live photography in this build. Every flat 2D visual (product
shots, bundle imagery, editorial "lookbook" spreads, team monograms) is a
**generated, art-directed graphic/typographic composition** — code, not a
placeholder — produced by `scripts/generate-product-art.mjs` into
`public/images/`. Each is an SVG built from the same palette tokens as the
rest of the site (obsidian/forest/gold/amber/parchment), with the flacon
silhouette, gold cap, and label typography matching the site's real
3D-rendered bottle.

**If real product photography or the official logo file becomes available**
(e.g. committed to `public/images/products/`, `public/images/bundles/`, or
`public/logo/`), swap the `src` paths in `lib/products.ts` — everything
downstream (cart, PDP-equivalent sections, bundle cards) picks it up with no
other changes. The Open Graph image and favicon (`app/opengraph-image.tsx`,
`app/icon.tsx`) are generated at build/request time via `next/og`'s
`ImageResponse`, so they need no image asset either.

Generated art uses plain `<img>` rather than `next/image`: Next's image
optimizer disallows SVG sources by default (a security default, not a
bug), and vector art doesn't benefit from raster optimization anyway. Real
raster photography dropped in later should use `next/image` for responsive
`sizes` and lazy loading, per the brief.

## E-Commerce: Real vs. Mock

`lib/commerce.ts` is the single commerce module: product/bundle data model,
cart-line resolution, discount codes, checkout, and an analytics stub
(`trackEvent`, called for `view_item`/`add_to_cart`/`begin_checkout`/
`remove_from_cart` — wire a real provider at that one seam).

- **Cart** (`store/cart-store.ts`, Zustand + `persist`): add/remove/update
  quantity, discount code, all persisted to `localStorage` and surviving
  reload. The nav's cart icon badge and the drawer are shared across every
  route.
- **Checkout** (`lib/commerce.ts#checkout` → `lib/shopify.ts`): if
  `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` and `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN`
  are set **and** every cart line's variant carries a real
  `shopifyVariantId`, checkout creates a real Shopify cart via the
  Storefront API (`cartCreate`) and redirects to Shopify's hosted checkout.
  Otherwise it falls through to a local mock flow that lands on
  `/order-confirmation`.
- **Bundles are real products, not a separate concept**: each `Bundle` in
  `lib/products.ts` is also registered as a single-variant `Product`
  (`BUNDLE_PRODUCTS`, ids prefixed `bundle-`) so "Add to Bag" on a bundle
  card reuses the exact same cart model at the bundle's real price — no
  special-cased line-item type anywhere else in the app.

### Going live on Shopify

1. Create products/variants in Shopify matching `lib/products.ts` (or edit
   `lib/products.ts` to match your existing catalog).
2. Set `shopifyProductId` / `shopifyVariantId` (the `gid://shopify/...` ids)
   on each entry.
3. Set env vars (`.env.local`):
   ```
   NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
   NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=your-storefront-api-public-token
   ```
4. Ship — `checkout()` picks up the real path automatically; no other code
   changes needed. If a request ever fails or credentials are missing, it
   silently falls back to the mock flow rather than breaking checkout.

## Business Inquiries

`components/forms/BusinessInquiryForm.tsx` is shared between `/business-inquiry`
and the contact section of `/help`. It validates client-side
(`lib/business-inquiry.ts`) and POSTs to `app/api/business-inquiry/route.ts`,
which re-validates server-side and logs the submission — see the
`// TODO: connect to CRM or email service` comment at the integration seam.

## Fonts

`next/font/google` loads Cormorant Garamond (display serif) and Inter
(sans) at build time (`app/fonts.ts`), each with an explicit `fallback`
stack (Georgia/system-serif and system-sans respectively) so the layout
holds its proportions even if the Google Fonts fetch is ever unavailable in
a given environment.

## Design System

- **Palette**: Obsidian `#050505`, Deep Forest `#0E1411`, Aged Gold
  `#C5A059`, Liquid Amber `#E6C588`, Parchment `#F5F4F0` — defined once as
  CSS custom properties in `app/globals.css` (`:root`) and mirrored into
  Tailwind's `@theme`. Gold/amber are accents only; obsidian/parchment
  carry the site.
- **Spacing scale**: `--space-3xs` → `--space-2xl`, reused everywhere.
- **Motion**: one easing curve (`--ease-velario`, an expo-out cubic-bezier)
  and duration set (`--dur-fast/med/slow`), reused for every hover,
  transition, and scroll animation.
- **Shell** (`components/shell/`): letterbox bars, fixed nav with cart
  badge + ambient-sound toggle + full-screen search/nav overlay, footer,
  custom cursor (glowing dot → frosted ring on hover), cart drawer — built
  once in `SiteShell.tsx`, used by the root layout, never redefined
  per-page.
- **Ambient sound**: a real Web Audio API–generated procedural drone
  (`lib/ambient-sound.ts`) — no external audio file, since none are
  permitted in this build.

## Engineering Notes

- **Tone mapping**: both `<Canvas>` instances (home + `AmbientCanvas`) set
  `ACESFilmicToneMapping` with a `0.82` exposure explicitly, rather than
  relying on renderer defaults, to keep the fog/bloom/emissive stack from
  blowing out to white.
- **Particle sizing**: `ParticleDust`'s point size is clamped
  (`clamp(rawSize, 1.0, 34.0)`) — without this, particles that drift very
  close to the camera balloon to cover the whole frame.
- **React Compiler–oriented ESLint rules** (`react-hooks/purity`,
  `react-hooks/immutability`, shipped as part of `eslint-config-next` 16)
  assume every hook return value is React-managed and every render-phase
  call is pure. R3F's whole imperative model — mutating `camera`/materials
  from `useThree()` inside a `useFrame` callback that runs on the WebGL
  render loop, not React's render phase — is a deliberate, standard
  exception to that. `eslint.config.mjs` scopes those specific rules off
  for `components/three/**` rather than disabling them globally.
- **Cache/rendering mode**: this project does *not* enable Next 16's
  `cacheComponents` — routes render dynamically as normal App Router pages;
  no `"use cache"` directives are needed anywhere.
- Wrapped every `<Canvas>` in a class-based `CanvasBoundary` error boundary
  with an animated (never static) CSS fallback, so a shader/context error
  degrades gracefully instead of white-screening a route.

## Verified

- `npm run build`, `npx tsc --noEmit`, and `npm run lint` all pass clean.
- `node scripts/smoke-test.mjs` heads-lessly loads every route plus a 404,
  checks for console/page errors and lost WebGL contexts, and drives the
  add-to-cart and business-inquiry flows end to end — all green.
- Manually scrolled the home page top to bottom (desktop + iPhone 13
  viewport via Playwright) confirming continuous camera/lighting/particle
  motion with no static dead zones and no hard cuts between acts (Section 0
  of the brief).
