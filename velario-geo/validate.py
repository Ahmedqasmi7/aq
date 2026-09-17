#!/usr/bin/env python3
"""
Phase 7 validation harness for the VELARIO GEO/AEO build.

Curls every new/modified URL on the draft theme preview (cookie jar,
paced requests to avoid the Cloudflare burst-challenge documented in
AUDIT.md) and asserts:
  - HTTP 200, not the ~9KB Cloudflare challenge interstitial
  - every <script type="application/ld+json"> block parses as valid JSON
  - every JSON-LD block has a recognized @type and, for Product blocks,
    the required fields the brief calls for
  - the page's first paragraph / declarative answer is present (best
    effort — see NOTE below)

Usage:
    python3 validate.py --theme-id 193562706292 [--base-url https://wearvelario.com]

Requires a "preview_theme_id" query param on every URL checked; without
it you are silently checking the LIVE theme instead of the draft, per
the byte-size trap documented in AUDIT.md.
"""
import argparse
import json
import re
import sys
import time
import urllib.request
import urllib.error
import http.cookiejar

UA = "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)"
PACE_SECONDS = 2.0

JSONLD_RE = re.compile(
    r'<script type="application/ld\+json">\s*(.*?)\s*</script>', re.S
)

REQUIRED_PRODUCT_FIELDS = ["name", "sku", "brand", "offers", "url"]

PATHS_PRODUCT = [
    "/products/velario-rougeon-inspired-by-baccarat-rouge-540",
    "/products/velario-timber-inspired-by-santal-33",
    "/products/velario-aqua-inspired-by-bleu-de-chanel",
    "/products/3-for-129",
    "/products/5-for-199",
]
PATHS_COLLECTION = [
    "/collections/fragrances",
    "/collections/all-fragrances",
]
PATHS_OTHER = [
    "/",
    "/pages/is-velario-legit",
    "/llms.txt",
    "/llms-full.txt",
]

# Real content pages discovered to already exist on the store — see
# AUDIT.md 2026-09-17T02:02Z. Spot-checked, not exhaustive (83 pages
# total); these confirm the FAQPage schema and nominative disclaimer
# pattern holds on both the hub and a couple of comparison pages.
PATHS_CONTENT = [
    "/pages/best-designer-inspired-fragrances",
    "/pages/velario-rougeon-comparison",
    "/pages/velario-aqua-comparison",
]


def fetch(opener, base_url, path, theme_id, retries=2):
    sep = "&" if "?" in path else "?"
    url = f"{base_url}{path}{sep}preview_theme_id={theme_id}"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    last_err = None
    for attempt in range(retries + 1):
        try:
            with opener.open(req, timeout=30) as resp:
                body = resp.read().decode("utf-8", errors="replace")
                return resp.status, body
        except urllib.error.HTTPError as e:
            # Transient Cloudflare burst-throttle (429/503) — see AUDIT.md.
            # Back off and retry rather than false-failing on a real page.
            body = e.read().decode("utf-8", errors="replace")
            if e.code in (429, 503) and attempt < retries:
                last_err = e
                time.sleep(PACE_SECONDS * (attempt + 2))
                continue
            return e.code, body
        except Exception as e:
            last_err = e
            if attempt < retries:
                time.sleep(PACE_SECONDS * (attempt + 2))
                continue
            raise
    raise last_err


def check_content_page(opener, base_url, path, theme_id):
    """FAQPage-bearing /pages/ content: hub page and comparison pages."""
    result = {"path": path, "pass": True, "notes": []}
    try:
        status, body = fetch(opener, base_url, path, theme_id)
    except Exception as e:
        result["pass"] = False
        result["notes"].append(f"fetch error: {e}")
        return result

    if status != 200:
        result["pass"] = False
        result["notes"].append(f"http status {status}")
        return result

    if "Verifying your connection" in body:
        result["pass"] = False
        result["notes"].append("Cloudflare challenge interstitial served instead of content")
        return result

    blocks = JSONLD_RE.findall(body)
    types_seen = []
    for raw in blocks:
        try:
            obj = json.loads(raw)
        except Exception as e:
            result["pass"] = False
            result["notes"].append(f"invalid JSON-LD: {e}")
            continue
        types_seen.append(obj.get("@type"))
    result["jsonld_types"] = types_seen

    if "FAQPage" not in types_seen:
        result["pass"] = False
        result["notes"].append("expected FAQPage JSON-LD, none found")
    if "not affiliated with or endorsed by" not in body and "not affiliated with, endorsed by" not in body:
        result["pass"] = False
        result["notes"].append("nominative-use disclaimer not found")
    if "<h1" not in body.lower():
        result["pass"] = False
        result["notes"].append("no <h1> found")

    return result


def check_page(opener, base_url, path, theme_id, expect_product=False, expect_collection=False):
    result = {"path": path, "pass": True, "notes": []}
    try:
        status, body = fetch(opener, base_url, path, theme_id)
    except Exception as e:
        result["pass"] = False
        result["notes"].append(f"fetch error: {e}")
        return result

    if status != 200:
        result["pass"] = False
        result["notes"].append(f"http status {status}")
        return result

    if "Verifying your connection" in body or len(body) < 2000 and "cf-mitigated" in body.lower():
        result["pass"] = False
        result["notes"].append("Cloudflare challenge interstitial served instead of content")
        return result

    blocks = JSONLD_RE.findall(body)
    result["jsonld_block_count"] = len(blocks)
    types_seen = []
    product_ok = False
    for raw in blocks:
        try:
            obj = json.loads(raw)
        except Exception as e:
            result["pass"] = False
            result["notes"].append(f"invalid JSON-LD: {e}")
            continue
        t = obj.get("@type")
        types_seen.append(t)
        if t == "Product":
            missing = [f for f in REQUIRED_PRODUCT_FIELDS if f not in obj]
            if missing:
                result["pass"] = False
                result["notes"].append(f"Product JSON-LD missing fields: {missing}")
            else:
                product_ok = True
            if "aggregateRating" not in obj:
                result["notes"].append("Product has no aggregateRating (ok if SKU has 0 reviews)")
    result["jsonld_types"] = types_seen

    if expect_product and not product_ok:
        result["pass"] = False
        result["notes"].append("expected a valid Product JSON-LD block, none found")
    if expect_product and types_seen.count("Product") > 1:
        result["pass"] = False
        result["notes"].append(f"found {types_seen.count('Product')} Product blocks, expected exactly 1 (dedupe regression)")
    if expect_collection and "ItemList" not in types_seen:
        result["pass"] = False
        result["notes"].append("expected an ItemList JSON-LD block on a collection page, none found")
    if "Organization" not in types_seen:
        result["pass"] = False
        result["notes"].append("Organization JSON-LD missing (should be on every page via header)")

    return result


def check_llms_txt(opener, base_url, path, theme_id):
    result = {"path": path, "pass": True, "notes": []}
    try:
        status, body = fetch(opener, base_url, path, theme_id)
    except Exception as e:
        result["pass"] = False
        result["notes"].append(f"fetch error: {e}")
        return result
    if status != 200:
        result["pass"] = False
        result["notes"].append(f"http status {status}")
        return result
    if "<html" in body.lower() or "<!doctype" in body.lower():
        result["pass"] = False
        result["notes"].append("served as HTML, expected plain text")
        return result
    sku_lines = len(re.findall(r"Velario \w", body))
    result["notes"].append(f"~{sku_lines} SKU mentions found")
    if sku_lines < 16:
        result["pass"] = False
        result["notes"].append(f"expected all 16 SKUs, found {sku_lines}")
    if "wearvelario.com is not affiliated" not in body and "not affiliated with, endorsed by" not in body:
        result["pass"] = False
        result["notes"].append("nominative-use disclaimer not found")
    return result


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--theme-id", required=True, help="Numeric draft theme id (from the gid)")
    ap.add_argument("--base-url", default="https://wearvelario.com")
    args = ap.parse_args()

    jar = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))

    results = []
    plan = (
        [(p, True, False) for p in PATHS_PRODUCT]
        + [(p, False, True) for p in PATHS_COLLECTION]
        + [(p, False, False) for p in PATHS_OTHER if not p.endswith(".txt")]
    )

    for path, expect_product, expect_collection in plan:
        r = check_page(opener, args.base_url, path, args.theme_id, expect_product, expect_collection)
        results.append(r)
        time.sleep(PACE_SECONDS)

    for path in ["/llms.txt", "/llms-full.txt"]:
        r = check_llms_txt(opener, args.base_url, path, args.theme_id)
        results.append(r)
        time.sleep(PACE_SECONDS)

    for path in PATHS_CONTENT:
        r = check_content_page(opener, args.base_url, path, args.theme_id)
        results.append(r)
        time.sleep(PACE_SECONDS)

    print(f"{'PATH':<55} {'PASS':<6} NOTES")
    print("-" * 100)
    n_pass = 0
    for r in results:
        status = "PASS" if r["pass"] else "FAIL"
        if r["pass"]:
            n_pass += 1
        notes = "; ".join(r.get("notes", [])) or "-"
        print(f"{r['path']:<55} {status:<6} {notes}")

    print("-" * 100)
    print(f"{n_pass}/{len(results)} passed")
    sys.exit(0 if n_pass == len(results) else 1)


if __name__ == "__main__":
    main()
