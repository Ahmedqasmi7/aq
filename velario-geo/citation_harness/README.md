# Velario citation-tracking harness

Phase 6 of the GEO/AEO brief. Tracks whether ChatGPT, Perplexity, Gemini,
and Google AI Mode name Velario across 50 real target prompts, and how
that changes week over week.

## What's here

- `prompts.py` — generates the 50 prompts (6 seed prompts from the brief
  + 44 generated from the real 16-SKU catalog and the category pages
  that already exist on the store — see `AUDIT.md`). Run it standalone
  to print the list: `python3 prompts.py`
- `engines.py` — per-engine Playwright drivers + the scoring logic
  (Velario named yes/no, position, cited URL, competitor brands named).
  The scoring logic has no browser dependency and is verified working.
- `run_citations.py` — the orchestrator. Drives a real, already-logged-in
  Chrome profile through all 50 prompts per engine, throttled, and
  writes `./citations/<date>.json`.
- `trend_report.py` — aggregates every run in `./citations/` into a
  mention-rate trend table. No browser dependency — verified working
  end-to-end against synthetic data (see AUDIT.md).

## Why this can't run in the environment that built it

The agent session that wrote this code has no browser at all — it's a
sandboxed backend environment. Everything that doesn't need a browser
(`prompts.py`, the scoring function in `engines.py`, `trend_report.py`)
was actually run and verified. The parts that DO need a browser
(`run_citations.py`, and the per-engine selectors in `engines.py`)
could not be tested against the real, live ChatGPT / Perplexity /
Gemini / Google AI Mode UIs, because this environment can't open one.

**Practical effect: the selectors in `engines.py` are a real, structured
starting point, not verified-working code.** Chat UIs change their DOM
often. Budget one calibration run before trusting this as a weekly job.

## Setup (run this on your own machine)

1. Install Playwright:
   ```
   pip install playwright
   playwright install chromium
   ```
2. Pick (or create) a Chrome profile directory where you're already
   logged into chatgpt.com, perplexity.ai, gemini.google.com, and a
   Google account with AI Mode access. This script never handles
   credentials itself — it reuses your real, already-authenticated
   session via `launch_persistent_context`. Something like:
   ```
   /Users/you/Library/Application Support/Google/Chrome/VelarioCitationProfile
   ```
   (macOS path shown; adjust for your OS.) Log into all four services
   in that profile manually first, once.
3. Calibration run — small, visible, so you can watch it and fix
   selectors as needed:
   ```
   python3 run_citations.py --profile-dir "/path/to/profile" \
       --engines chatgpt --limit 3 --headed
   ```
   Watch what happens. If it fails to find the input box, the response
   container, or citation links, open DevTools on the real page,
   inspect the actual current selector, and update `SELECTORS` in
   `engines.py` for that engine. Repeat per engine.
4. Once each engine works, run the full batch:
   ```
   python3 run_citations.py --profile-dir "/path/to/profile"
   ```
   This takes a while by design — 50 prompts × 4 engines × an 8-second
   throttle between requests, plus response wait time. Expect 30-60+
   minutes for a full run. That's intentional: the brief says "throttle
   requests, do not hammer these services."
5. Check the trend:
   ```
   python3 trend_report.py
   ```
6. Repeat weekly. Each run appends a new `./citations/<date>.json` file;
   `trend_report.py` picks up every file automatically.

## Known limitations, stated plainly

- **Google AI Mode has no stable per-query URL** in the general case —
  the `udm=50` parameter used here is a common way to force the AI Mode
  tab, but Google can change this at any time without notice.
- **"Position in the list"** is a heuristic (splits the response on
  numbered/bulleted list markers and finds which item mentions Velario
  first) — it will misfire on responses that don't use a numbered list
  format. Treat position as directional, not exact.
- **Competitor detection** only recognizes the house names Velario's own
  comparison pages already reference (Creed, YSL, Tom Ford, Parfums de
  Marly, Byredo, Chanel, Dior, Le Labo, Kilian, Louis Vuitton, Maison
  Francis Kurkdjian) — extend `KNOWN_COMPETITOR_HOUSES` in `engines.py`
  if you want to track others.
- **No login/session handling is built in on purpose.** This script
  will never store, request, or transmit your credentials for any of
  these services — it only reuses whatever session already exists in
  the Chrome profile you point it at.
