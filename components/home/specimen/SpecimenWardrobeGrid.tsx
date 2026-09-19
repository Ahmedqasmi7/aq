"use client";

import Link from "next/link";
import { PRODUCTS } from "@/lib/commerce";
import { Reveal } from "./Reveal";

/**
 * Section 4. Real catalog data — three shipping signatures at their real
 * prices, plus a fourth slot held for what's next rather than a fabricated
 * product. No hero-copy dupe-pricing bleeds in here; this grid tells the
 * truth about what's actually for sale today.
 */
export function SpecimenWardrobeGrid() {
  return (
    <Reveal as="section" className="specimen-wardrobe">
      <h2 className="specimen-wardrobe__heading">A Wardrobe of Modern Icons.</h2>

      <div className="specimen-wardrobe__grid">
        {PRODUCTS.map((product) => {
          const price = Math.min(...product.variants.map((v) => v.price));
          return (
            <Link
              key={product.id}
              href="/bundle"
              data-cursor="hover"
              className="specimen-card"
            >
              <div className="specimen-card__plinth">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.images[0].src} alt={product.images[0].alt} loading="lazy" />
              </div>
              <div className="specimen-card__body">
                <div className="specimen-card__row">
                  <span className="specimen-card__name">{product.name}</span>
                  <span className="specimen-card__price">From ${price}</span>
                </div>
                <span className="specimen-card__tagline">{product.tagline}</span>
              </div>
            </Link>
          );
        })}

        <div className="specimen-card specimen-card--soon">
          <div className="specimen-card__plinth">
            <span className="specimen-card__soon-mark" aria-hidden>
              IV
            </span>
          </div>
          <div className="specimen-card__body">
            <div className="specimen-card__row">
              <span className="specimen-card__name">Profile No. 04</span>
              <span className="specimen-card__price specimen-card__price--soon">Coming Soon</span>
            </div>
            <span className="specimen-card__tagline">In development.</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* :global — Reveal is a custom component, so styled-jsx's automatic
           scope-class injection never reaches the element it renders. */
        :global(.specimen-wardrobe) {
          display: block;
          padding: 8vh var(--spec-container-pad);
        }
        .specimen-wardrobe__heading {
          font-family: var(--font-display-specimen), serif;
          font-weight: 700;
          font-size: clamp(32px, 4vw, 56px);
          line-height: 0.95;
          letter-spacing: -0.02em;
          color: var(--spec-cream);
          margin: 0 0 4vh;
        }
        .specimen-wardrobe__grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--spec-gutter);
        }
        :global(.specimen-card) {
          display: block;
          color: inherit;
          text-decoration: none;
          transition: transform 280ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        :global(.specimen-card:hover) {
          transform: translateY(-6px);
        }
        .specimen-card__plinth {
          position: relative;
          aspect-ratio: 4 / 5;
          background: linear-gradient(180deg, #17130f, #0b0908);
          border: 1px solid rgba(201, 162, 75, 0.3);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .specimen-card__plinth img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .specimen-card__soon-mark {
          font-family: var(--font-display-specimen), serif;
          font-weight: 700;
          font-size: 48px;
          color: var(--spec-gold);
          opacity: 0.35;
        }
        .specimen-card__body {
          padding-top: 1rem;
        }
        .specimen-card__row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 0.75rem;
        }
        .specimen-card__name {
          font-family: var(--font-display-specimen), serif;
          font-weight: 700;
          font-size: 20px;
          color: var(--spec-cream);
        }
        .specimen-card__price {
          font-family: var(--font-sans-specimen), sans-serif;
          font-size: 12px;
          letter-spacing: 0.06em;
          color: var(--spec-gold);
          white-space: nowrap;
        }
        .specimen-card__price--soon {
          opacity: 0.6;
        }
        .specimen-card__tagline {
          display: block;
          margin-top: 0.5rem;
          font-family: var(--font-sans-specimen), sans-serif;
          font-size: 13px;
          line-height: 1.5;
          color: var(--spec-cream);
          opacity: 0;
          max-height: 0;
          overflow: hidden;
          transition: opacity 280ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        :global(.specimen-card:hover) .specimen-card__tagline {
          opacity: 0.65;
          max-height: 3em;
        }
        .specimen-card--soon {
          cursor: default;
          opacity: 0.7;
        }

        @media (max-width: 900px) {
          .specimen-wardrobe__grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 520px) {
          .specimen-wardrobe__grid {
            grid-template-columns: 1fr;
          }
        }
        @media (hover: none) {
          .specimen-card__tagline {
            opacity: 0.65;
            max-height: 3em;
          }
        }
      `}</style>
    </Reveal>
  );
}
