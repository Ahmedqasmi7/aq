"use client";

const ITEMS = [
  "35% FRAGRANCE OIL",
  "10+ HOUR WEAR",
  "FREE SHIPPING BOTH WAYS",
  "MADE IN THE USA",
  "3 SIGNATURES",
  "30-DAY MONEY BACK",
];

/**
 * Section 2. The hard cut after the hero — no gradient, no scroll fade,
 * just a gold rule and this strip. Duplicated once for a seamless loop.
 */
export function SpecimenMarquee() {
  const track = [...ITEMS, ...ITEMS];

  return (
    <div className="specimen-marquee" aria-label="VELARIO facts">
      <div className="specimen-marquee__track">
        {track.map((item, i) => (
          <span className="specimen-marquee__item" key={`${item}-${i}`}>
            {item}
          </span>
        ))}
      </div>

      <style jsx>{`
        .specimen-marquee {
          position: relative;
          height: 44px;
          border-top: 1px solid var(--spec-gold);
          border-bottom: 1px solid var(--spec-gold);
          overflow-x: auto;
          overflow-y: hidden;
          scrollbar-width: none;
        }
        .specimen-marquee::-webkit-scrollbar {
          display: none;
        }
        .specimen-marquee__track {
          display: flex;
          align-items: center;
          height: 100%;
          width: max-content;
          animation: specimen-marquee-scroll 8s linear infinite;
        }
        .specimen-marquee:hover .specimen-marquee__track {
          animation-play-state: paused;
        }
        .specimen-marquee__item {
          flex: none;
          padding: 0 2.5rem;
          font-family: var(--font-sans-specimen), sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--spec-cream);
          opacity: 0.85;
          white-space: nowrap;
        }
        .specimen-marquee__item::after {
          content: "";
          display: inline-block;
          width: 4px;
          height: 4px;
          margin-left: 2.5rem;
          background: var(--spec-gold);
          border-radius: 50%;
          vertical-align: middle;
        }

        @keyframes specimen-marquee-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .specimen-marquee__track {
            animation: none;
          }
          .specimen-marquee {
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
}
