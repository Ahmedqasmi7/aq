"""
Per-engine Playwright drivers for the Velario citation-tracking harness.

IMPORTANT — read before running:
This code was written without the ability to test it against the real,
live ChatGPT / Perplexity / Gemini / Google AI Mode UIs (this agent's
environment has no browser). The selectors below are a best-effort
starting point based on each product's known UI structure as of this
writing, NOT verified working selectors. Chat-UI frontends change
often and without notice. Expect to:
  1. Run this once per engine in headed mode (HEADLESS=false) and watch
     it fail somewhere.
  2. Open DevTools on the real page, find the current selector for the
     response container and citation links, and update SELECTORS below.
  3. Only then trust it as a repeatable weekly job.
This is real, structured automation code to build on — not a finished,
verified tool. Treat the first run as a calibration run, not data.
"""
from __future__ import annotations

import re
import time
from dataclasses import dataclass, field


@dataclass
class EngineResult:
    engine: str
    prompt: str
    response_text: str = ""
    cited_urls: list[str] = field(default_factory=list)
    error: str | None = None


# Best-effort selectors — SEE MODULE DOCSTRING. Update these after a
# real calibration run against each live product.
SELECTORS = {
    "chatgpt": {
        "url": "https://chatgpt.com/",
        "input": "#prompt-textarea",
        "submit_key": "Enter",
        "response_container": '[data-message-author-role="assistant"]:last-of-type',
        "stop_generating_button": 'button[aria-label="Stop generating"]',
        "citation_links": '[data-message-author-role="assistant"]:last-of-type a[href^="http"]',
    },
    "perplexity": {
        "url": "https://www.perplexity.ai/",
        "input": 'textarea[placeholder*="Ask"]',
        "submit_key": "Enter",
        "response_container": '.prose:last-of-type, [class*="answer"]:last-of-type',
        "citation_links": 'a[href^="http"][class*="citation"], a[href^="http"][target="_blank"]',
    },
    "gemini": {
        "url": "https://gemini.google.com/app",
        "input": '[contenteditable="true"][role="textbox"]',
        "submit_key": "Enter",
        "response_container": '[data-response-index]:last-of-type, .model-response-text:last-of-type',
        "citation_links": '[data-response-index]:last-of-type a[href^="http"]',
    },
    "google_ai_mode": {
        # Google AI Mode is reached by searching, then clicking the "AI
        # Mode" tab — there is no stable direct URL for a given query.
        "url": "https://www.google.com/search?udm=50&q={query}",
        "input": None,  # query goes in the URL directly, no typing needed
        "submit_key": None,
        "response_container": '[data-attrid*="ai"], .LT6XE, [jsname]',
        "citation_links": '[data-attrid*="ai"] a[href^="http"], .LT6XE a[href^="http"]',
    },
}

VELARIO_DOMAIN = "wearvelario.com"

# Real competitor house names actually referenced across Velario's own
# comparison pages (see AUDIT.md) — used to score "competitor brands
# named" in the engine's response, not guessed.
KNOWN_COMPETITOR_HOUSES = [
    "Creed", "YSL", "Yves Saint Laurent", "Tom Ford", "Parfums de Marly",
    "Byredo", "Chanel", "Dior", "Le Labo", "Kilian", "Louis Vuitton",
    "Maison Francis Kurkdjian", "MFK",
]


def score_response(engine: str, prompt: str, response_text: str, cited_urls: list[str]) -> dict:
    """Pure scoring logic — no browser needed, unit-testable on its own."""
    text_lower = response_text.lower()
    velario_named = "velario" in text_lower
    velario_position = None
    if velario_named:
        # crude "position" proxy: split on common list markers and find
        # which numbered/bulleted item first mentions Velario.
        items = re.split(r"\n(?=\d+[\.\)]\s|[-*]\s)", response_text)
        for i, item in enumerate(items, 1):
            if "velario" in item.lower():
                velario_position = i
                break

    velario_cited_url = next((u for u in cited_urls if VELARIO_DOMAIN in u), None)
    competitors_named = sorted({
        house for house in KNOWN_COMPETITOR_HOUSES
        if house.lower() in text_lower
    })

    return {
        "velario_named": velario_named,
        "velario_position": velario_position,
        "velario_cited_url": velario_cited_url,
        "all_cited_urls": cited_urls,
        "competitors_named": competitors_named,
    }


class EngineDriver:
    """
    Thin wrapper around a Playwright page for one engine. Assumes the
    browser context is ALREADY logged in (see run_citations.py — uses
    launch_persistent_context against a real Chrome profile so the
    user's own login session carries over; this script never handles
    or stores credentials).
    """

    def __init__(self, page, engine_name: str):
        self.page = page
        self.engine_name = engine_name
        self.cfg = SELECTORS[engine_name]

    def ask(self, prompt: str, timeout_ms: int = 45000) -> EngineResult:
        try:
            if self.engine_name == "google_ai_mode":
                return self._ask_google_ai_mode(prompt, timeout_ms)
            return self._ask_chat_style(prompt, timeout_ms)
        except Exception as e:  # noqa: BLE001 - surface any failure per-prompt, don't crash the run
            return EngineResult(engine=self.engine_name, prompt=prompt, error=str(e))

    def _ask_chat_style(self, prompt: str, timeout_ms: int) -> EngineResult:
        page = self.page
        page.goto(self.cfg["url"], wait_until="domcontentloaded")
        page.wait_for_selector(self.cfg["input"], timeout=timeout_ms)
        page.click(self.cfg["input"])
        page.keyboard.type(prompt, delay=15)
        page.keyboard.press(self.cfg["submit_key"])

        # Best-effort "response finished" wait: prefer a stop-generating
        # button disappearing; fall back to a fixed settle time. This is
        # the single most likely thing to need tuning per engine.
        stop_sel = self.cfg.get("stop_generating_button")
        if stop_sel:
            try:
                page.wait_for_selector(stop_sel, timeout=5000)
                page.wait_for_selector(stop_sel, state="detached", timeout=timeout_ms)
            except Exception:
                page.wait_for_timeout(8000)
        else:
            page.wait_for_timeout(8000)

        container = page.locator(self.cfg["response_container"]).last
        response_text = container.inner_text() if container.count() else ""
        links = page.locator(self.cfg["citation_links"])
        cited_urls = []
        for i in range(min(links.count(), 30)):
            href = links.nth(i).get_attribute("href")
            if href and href.startswith("http"):
                cited_urls.append(href)

        return EngineResult(
            engine=self.engine_name, prompt=prompt,
            response_text=response_text, cited_urls=list(dict.fromkeys(cited_urls)),
        )

    def _ask_google_ai_mode(self, prompt: str, timeout_ms: int) -> EngineResult:
        from urllib.parse import quote
        page = self.page
        url = self.cfg["url"].format(query=quote(prompt))
        page.goto(url, wait_until="domcontentloaded")
        page.wait_for_timeout(6000)  # AI Mode content streams in, no reliable "done" signal
        container = page.locator(self.cfg["response_container"]).first
        response_text = container.inner_text() if container.count() else ""
        links = page.locator(self.cfg["citation_links"])
        cited_urls = []
        for i in range(min(links.count(), 30)):
            href = links.nth(i).get_attribute("href")
            if href and href.startswith("http"):
                cited_urls.append(href)
        return EngineResult(
            engine=self.engine_name, prompt=prompt,
            response_text=response_text, cited_urls=list(dict.fromkeys(cited_urls)),
        )
