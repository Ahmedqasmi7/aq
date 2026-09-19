"use client";

import Link from "next/link";
import { ConcentrationGauge } from "./ConcentrationGauge";

/**
 * Section 1. The argument as layout, not decoration: a single vertical
 * measure of concentration (the gauge) standing in for photography. No
 * model, no lifestyle prop — that comes later, below the fold, where
 * aspiration belongs. Above the fold is proof.
 */
export function SpecimenHero() {
  return (
    <section className="specimen-hero">
      <div className="specimen-hero__grid">
        <div className="specimen-hero__copy">
          <span className="specimen-hero__eyebrow">EXTRAIT DE PARFUM · MADE IN USA</span>

          <h1 className="specimen-hero__headline">
            <span className="line">DESIGNER</span>
            <span className="line">PROFILES.</span>
            <span className="line line--accent">35% OIL. $49.99.</span>
            <span className="line line--statement">THE MARKUP WAS THE ONLY THING THAT WAS EVER REAL.</span>
          </h1>

          <p className="specimen-hero__subhead">
            Full-size 50ml. The same profiles selling for $300, built at extrait concentration
            instead of diluted to sell the bottle.
          </p>

          <div className="specimen-hero__ctas">
            <Link href="/bundle" data-cursor="hover" className="specimen-btn specimen-btn--primary">
              Shop Bestsellers
            </Link>
            <Link href="/bundle" data-cursor="hover" className="specimen-btn specimen-btn--secondary">
              Shop All Signatures
            </Link>
          </div>
        </div>

        <div className="specimen-hero__gauge">
          <ConcentrationGauge />
        </div>
      </div>

      <style jsx>{`
        .specimen-hero {
          position: relative;
          min-height: 100svh;
          display: flex;
        }
        .specimen-hero__grid {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          column-gap: var(--spec-gutter);
          padding: calc(var(--letterbox) + 5.5rem) var(--spec-container-pad) 14vh;
          align-items: end;
          min-height: 100svh;
          box-sizing: border-box;
        }
        .specimen-hero__copy {
          grid-column: 1 / 8;
        }
        .specimen-hero__gauge {
          grid-column: 9 / 13;
          display: flex;
          justify-content: center;
        }
        .specimen-hero__eyebrow {
          display: block;
          font-family: var(--font-sans-specimen), sans-serif;
          font-size: 11px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--spec-gold);
        }
        .specimen-hero__headline {
          margin: var(--space-sm, 1.25rem) 0 0;
          font-family: var(--font-display-specimen), serif;
          font-weight: 700;
          font-size: clamp(40px, 5.4vw, 92px);
          line-height: 0.88;
          letter-spacing: -0.02em;
          color: var(--spec-cream);
        }
        .specimen-hero__headline .line {
          display: block;
        }
        .specimen-hero__headline .line--accent {
          color: var(--spec-gold);
          font-style: italic;
        }
        .specimen-hero__headline .line--statement {
          margin-top: 0.5em;
          font-size: clamp(16px, 2.1vw, 30px);
          line-height: 1.2;
          letter-spacing: -0.01em;
          color: var(--spec-cream);
          opacity: 0.88;
        }
        .specimen-hero__subhead {
          margin: var(--space-sm, 1.25rem) 0 0;
          max-width: 46ch;
          font-family: var(--font-sans-specimen), sans-serif;
          font-size: 17px;
          line-height: 1.55;
          color: var(--spec-cream);
          opacity: 0.7;
        }
        .specimen-hero__ctas {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-top: var(--space-md, 2rem);
        }
        /* :global — Link isn't a native element, so styled-jsx's automatic
           scope-class injection never reaches it. */
        :global(.specimen-btn) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 56px;
          padding: 0 2rem;
          font-family: var(--font-sans-specimen), sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 280ms cubic-bezier(0.16, 1, 0.3, 1), color 280ms cubic-bezier(0.16, 1, 0.3, 1),
            border-color 280ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        :global(.specimen-btn--primary) {
          background: var(--spec-cream);
          color: var(--spec-base);
          border: 1px solid var(--spec-cream);
        }
        :global(.specimen-btn--primary:hover) {
          background: var(--spec-gold-bright);
          border-color: var(--spec-gold-bright);
        }
        :global(.specimen-btn--secondary) {
          background: transparent;
          color: var(--spec-cream);
          border: 1px solid var(--spec-cream);
        }
        :global(.specimen-btn--secondary:hover) {
          border-color: var(--spec-gold);
          color: var(--spec-gold);
        }

        @media (max-width: 900px) {
          .specimen-hero__grid {
            grid-template-columns: 1fr;
            align-items: start;
            padding: calc(var(--letterbox) + 6rem) var(--spec-container-pad) 8vh;
            row-gap: 0;
          }
          .specimen-hero__copy {
            grid-column: 1 / -1;
          }
          .specimen-hero__gauge {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </section>
  );
}
