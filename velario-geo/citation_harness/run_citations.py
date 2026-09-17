#!/usr/bin/env python3
"""
Velario citation-tracking harness — Phase 6.

Drives a REAL, ALREADY-LOGGED-IN Chrome profile through the 50 target
prompts across ChatGPT, Perplexity, Gemini, and Google AI Mode, scores
each response for whether/where Velario is named and what's cited, and
writes results to ./citations/<date>.json.

THIS SCRIPT CANNOT RUN IN THE AGENT ENVIRONMENT THAT WROTE IT — there is
no browser here. It's meant to run on YOUR machine, where you're already
logged into these services in a normal Chrome profile. See README.md
before running. The per-engine selectors in engines.py are an untested
best-effort starting point (see that file's docstring) — expect to
calibrate them against the real UIs on your first run.

Usage:
    python3 run_citations.py --profile-dir "/path/to/chrome/profile" \
        [--engines chatgpt,perplexity,gemini,google_ai_mode] \
        [--limit 5]   # for a quick calibration run instead of all 50
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from datetime import date, datetime
from pathlib import Path

from prompts import build_prompt_list
from engines import EngineDriver, score_response

THROTTLE_SECONDS = 8  # brief says "throttle requests" — be polite to these services
OUTPUT_DIR = Path(__file__).parent / "citations"


def run(profile_dir: str, engine_names: list[str], limit: int | None, headless: bool):
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print(
            "Playwright isn't installed. Run:\n"
            "  pip install playwright\n"
            "  playwright install chromium\n",
            file=sys.stderr,
        )
        sys.exit(1)

    prompts = build_prompt_list()
    if limit:
        prompts = prompts[:limit]

    OUTPUT_DIR.mkdir(exist_ok=True)
    run_id = datetime.now().strftime("%Y-%m-%dT%H-%M-%S")
    out_path = OUTPUT_DIR / f"{date.today().isoformat()}.json"

    results = []
    with sync_playwright() as p:
        # Persistent context = your real Chrome profile, real cookies,
        # real login sessions. This script never touches credentials
        # itself — it relies entirely on you already being logged in.
        context = p.chromium.launch_persistent_context(
            profile_dir, headless=headless, channel="chrome",
        )
        page = context.pages[0] if context.pages else context.new_page()

        for engine_name in engine_names:
            driver = EngineDriver(page, engine_name)
            for i, prompt in enumerate(prompts, 1):
                print(f"[{engine_name}] {i}/{len(prompts)}: {prompt}")
                result = driver.ask(prompt)
                if result.error:
                    print(f"  ERROR: {result.error}")
                    entry = {
                        "run_id": run_id, "engine": engine_name, "prompt": prompt,
                        "error": result.error,
                    }
                else:
                    score = score_response(
                        engine_name, prompt, result.response_text, result.cited_urls,
                    )
                    entry = {
                        "run_id": run_id,
                        "engine": engine_name,
                        "prompt": prompt,
                        "response_text": result.response_text,
                        **score,
                    }
                    flag = "YES" if score["velario_named"] else "no"
                    print(f"  Velario named: {flag}"
                          + (f" (position {score['velario_position']})" if score["velario_position"] else ""))
                results.append(entry)
                time.sleep(THROTTLE_SECONDS)

        context.close()

    # Append to today's file rather than overwrite, in case this is run
    # in multiple engine batches across the day.
    existing = []
    if out_path.exists():
        existing = json.loads(out_path.read_text())
    out_path.write_text(json.dumps(existing + results, indent=2))
    print(f"\nWrote {len(results)} results to {out_path}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--profile-dir", required=True,
                     help="Path to a Chrome user-data-dir where you're already logged into these services")
    ap.add_argument("--engines", default="chatgpt,perplexity,gemini,google_ai_mode")
    ap.add_argument("--limit", type=int, default=None,
                     help="Only run the first N prompts — use this for a calibration run")
    ap.add_argument("--headed", action="store_true",
                     help="Show the browser window (recommended for calibration)")
    args = ap.parse_args()

    run(
        profile_dir=args.profile_dir,
        engine_names=args.engines.split(","),
        limit=args.limit,
        headless=not args.headed,
    )


if __name__ == "__main__":
    main()
