# Google Search Console + Bing Webmaster Tools — manual submission steps

I can't do this myself: both require a logged-in browser session, which
isn't available in this environment. These are exact, ready-to-run steps
— should take about 5 minutes total once you're logged into each.

## What needs submitting

- Sitemap: `https://wearvelario.com/sitemap.xml` (real, live, verified
  working — see AUDIT.md 2026-09-17. Shopify maintains this
  automatically in real time; you never need to regenerate it by hand.)
- New URLs worth an explicit index request, since they were confirmed to
  exist but may not be freshly crawled yet:
  - `https://wearvelario.com/llms.txt`
  - `https://wearvelario.com/llms-full.txt`
  - `https://wearvelario.com/pages/best-designer-inspired-fragrances`

## Google Search Console

1. Go to https://search.google.com/search-console and select the
   `wearvelario.com` property (or add it if it isn't there yet — Domain
   property, verify via the DNS TXT record your registrar gives you).
2. Left sidebar → **Sitemaps**.
3. Under "Add a new sitemap," enter `sitemap.xml` and click **Submit**.
   (If it's already listed, you're done — check its status shows
   "Success," not an error.)
4. For the individual URLs above: use the **URL Inspection** tool (top
   search bar in GSC), paste the full URL, wait for it to inspect, then
   click **Request Indexing** if it says the URL isn't indexed yet.
   Repeat for each of the 3 URLs listed above.

## Bing Webmaster Tools

1. Go to https://www.bing.com/webmasters and select (or add) the
   `wearvelario.com` site.
2. Left sidebar → **Sitemaps**.
3. Click **Submit sitemap**, enter `https://wearvelario.com/sitemap.xml`,
   submit.
4. For faster indexing of the specific new URLs: left sidebar →
   **URL Submission** (or IndexNow, if enabled) → paste each of the 3
   URLs above → submit.

## IndexNow (optional, fast-path for both Bing and other participating engines)

If you want pings to go out automatically going forward rather than
manually per-URL, Bing Webmaster Tools has an **IndexNow** section that
generates an API key for the domain. That's a one-time setup step I
didn't do myself since it requires uploading a key-verification file to
your Bing account and I don't have that login — but once you generate
the key, submitting future URLs (or automating it) becomes a single
authenticated `GET`/`POST` request, no browser needed. Worth doing once
you're in there anyway.
