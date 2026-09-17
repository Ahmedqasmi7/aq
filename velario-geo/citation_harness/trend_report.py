#!/usr/bin/env python3
"""
Aggregates every ./citations/<date>.json run into a trend table.

No browser needed — pure data aggregation, fully testable on its own
(and tested below with synthetic data, since no real run exists yet).

Usage:
    python3 trend_report.py            # prints a summary table
    python3 trend_report.py --csv out.csv
"""
from __future__ import annotations

import argparse
import csv
import json
import sys
from collections import defaultdict
from pathlib import Path

CITATIONS_DIR = Path(__file__).parent / "citations"


def load_all_runs() -> list[dict]:
    rows = []
    for f in sorted(CITATIONS_DIR.glob("*.json")):
        try:
            rows.extend(json.loads(f.read_text()))
        except (json.JSONDecodeError, OSError) as e:
            print(f"skipping unreadable file {f}: {e}", file=sys.stderr)
    return rows


def build_trend(rows: list[dict]) -> list[dict]:
    """One row per (run_date, engine): mention rate, avg position, top competitors."""
    by_key = defaultdict(list)
    for r in rows:
        run_date = r.get("run_id", "unknown")[:10]
        by_key[(run_date, r.get("engine", "unknown"))].append(r)

    trend = []
    for (run_date, engine), entries in sorted(by_key.items()):
        total = len(entries)
        named = [e for e in entries if e.get("velario_named")]
        positions = [e["velario_position"] for e in named if e.get("velario_position")]
        competitor_counts = defaultdict(int)
        for e in entries:
            for c in e.get("competitors_named", []) or []:
                competitor_counts[c] += 1
        top_competitors = sorted(competitor_counts, key=competitor_counts.get, reverse=True)[:3]

        trend.append({
            "run_date": run_date,
            "engine": engine,
            "prompts_run": total,
            "velario_named_count": len(named),
            "mention_rate_pct": round(100 * len(named) / total, 1) if total else 0.0,
            "avg_position_when_named": round(sum(positions) / len(positions), 1) if positions else None,
            "top_competitors_named": ", ".join(top_competitors),
        })
    return trend


def print_table(trend: list[dict]):
    if not trend:
        print("No runs found in ./citations/ yet. Run run_citations.py first.")
        return
    headers = ["run_date", "engine", "prompts_run", "velario_named_count",
               "mention_rate_pct", "avg_position_when_named", "top_competitors_named"]
    widths = {h: max(len(h), max(len(str(row[h])) for row in trend)) for h in headers}
    print(" | ".join(h.ljust(widths[h]) for h in headers))
    print("-+-".join("-" * widths[h] for h in headers))
    for row in trend:
        print(" | ".join(str(row[h]).ljust(widths[h]) for h in headers))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", help="Also write the trend table to this CSV path")
    args = ap.parse_args()

    rows = load_all_runs()
    trend = build_trend(rows)
    print_table(trend)

    if args.csv and trend:
        with open(args.csv, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=list(trend[0].keys()))
            writer.writeheader()
            writer.writerows(trend)
        print(f"\nWrote CSV to {args.csv}")


if __name__ == "__main__":
    main()
