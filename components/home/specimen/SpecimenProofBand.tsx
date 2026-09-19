"use client";

import { Reveal } from "./Reveal";

const CELLS = [
  { number: "4.87", label: "Average Rating" },
  { number: "10,000+", label: "Bottles Sold" },
  { number: "30 Days", label: "Money Back, Opened or Not" },
];

/** Section 3. Three numbers, no icons — icons cheapen numbers. */
export function SpecimenProofBand() {
  return (
    <Reveal as="section" className="specimen-proof">
      <div className="specimen-proof__grid">
        {CELLS.map((cell) => (
          <div className="specimen-proof__cell" key={cell.label}>
            <span className="specimen-proof__number">{cell.number}</span>
            <span className="specimen-proof__label">{cell.label}</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .specimen-proof__grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        }
        .specimen-proof__cell {
          padding: 4.5rem var(--spec-container-pad);
          border-left: 1px solid var(--spec-gold);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.75rem;
        }
        .specimen-proof__cell:first-child {
          border-left: none;
        }
        .specimen-proof__number {
          font-family: var(--font-display-specimen), serif;
          font-weight: 700;
          font-size: 64px;
          line-height: 1;
          letter-spacing: -0.02em;
          color: var(--spec-cream);
        }
        .specimen-proof__label {
          font-family: var(--font-sans-specimen), sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--spec-gold);
        }

        @media (max-width: 900px) {
          .specimen-proof__grid {
            grid-template-columns: 1fr;
          }
          .specimen-proof__cell {
            border-left: none;
            border-top: 1px solid var(--spec-gold);
            padding: 2.5rem var(--spec-container-pad);
          }
          .specimen-proof__cell:first-child {
            border-top: none;
          }
          .specimen-proof__number {
            font-size: 48px;
          }
        }
      `}</style>
    </Reveal>
  );
}
