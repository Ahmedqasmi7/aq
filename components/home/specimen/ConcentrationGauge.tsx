"use client";

import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "./useMediaQuery";

const FILL_PCT = 35;
const DESIGNER_MIN = 5;
const DESIGNER_MAX = 20;

/**
 * The signature element of the specimen hero. A literal measure: the column
 * represents 0–100% oil concentration, the hatched band marks where every
 * other designer EDP sits (5–20%), and the fill shows VELARIO's 35% —
 * roughly double the top of that range. A visitor who reads nothing else
 * on the page still gets the whole argument from this one shape.
 */
export function ConcentrationGauge() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const horizontal = useMediaQuery("(max-width: 640px)");
  const [inView, setInView] = useState(false);
  const filled = reducedMotion || inView;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || filled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [filled]);

  const fillStyle = horizontal
    ? { width: filled ? `${FILL_PCT}%` : "0%" }
    : { height: filled ? `${FILL_PCT}%` : "0%" };

  const hatchStyle = horizontal
    ? { left: `${DESIGNER_MIN}%`, width: `${DESIGNER_MAX - DESIGNER_MIN}%` }
    : { bottom: `${DESIGNER_MIN}%`, height: `${DESIGNER_MAX - DESIGNER_MIN}%` };

  const tickStyle = horizontal ? { left: `${FILL_PCT}%` } : { bottom: `${FILL_PCT}%` };

  const hatchLabelStyle = horizontal
    ? undefined
    : { bottom: `${DESIGNER_MIN + (DESIGNER_MAX - DESIGNER_MIN) / 2}%` };

  const tickLabelStyle = horizontal ? undefined : { bottom: `${FILL_PCT}%` };

  return (
    <div
      ref={wrapRef}
      className={`gauge ${horizontal ? "gauge--horizontal" : ""}`}
      role="img"
      aria-label={`Concentration gauge: VELARIO is bottled at 35 percent extrait oil, versus a 5 to 20 percent industry range for designer eau de parfum.`}
    >
      <svg
        className="gauge__bottle"
        viewBox="0 0 120 420"
        preserveAspectRatio="xMidYMax meet"
        aria-hidden
      >
        <rect x="50" y="4" width="20" height="16" rx="3" fill="var(--spec-cream)" />
        <rect x="42" y="18" width="36" height="28" rx="4" fill="var(--spec-cream)" />
        <path
          d="M30 46 L90 46 L100 400 A10 10 0 0 1 90 410 L30 410 A10 10 0 0 1 20 400 Z"
          fill="none"
          stroke="var(--spec-cream)"
          strokeWidth="2"
        />
        <line
          x1="22"
          y1={410 - (410 - 46) * (FILL_PCT / 100)}
          x2="98"
          y2={410 - (410 - 46) * (FILL_PCT / 100)}
          stroke="var(--spec-amber)"
          strokeWidth="2"
        />
      </svg>

      <div className="gauge__column">
        <div className="gauge__hatch" style={hatchStyle} />
        <div className="gauge__fill" style={fillStyle} />
        <div className="gauge__tick" style={tickStyle} />
      </div>

      {/* Labels live outside the column's overflow:hidden clip, positioned
          to line up with the hatch band and tick line inside it. */}
      <div className="gauge__labels">
        <span className="gauge__hatch-label" style={hatchLabelStyle}>
          DESIGNER RANGE 5–20%
        </span>
        <span className="gauge__tick-label" style={tickLabelStyle}>
          35% EXTRAIT
        </span>
      </div>

      <style jsx>{`
        .gauge {
          position: relative;
          width: 64px;
          height: 480px;
          margin: 0 auto;
        }
        .gauge__bottle {
          position: absolute;
          inset: -12px -60px auto -60px;
          width: calc(100% + 120px);
          height: auto;
          opacity: 0.12;
          pointer-events: none;
        }
        .gauge__column {
          position: relative;
          width: 100%;
          height: 100%;
          border: 1px solid var(--spec-gold);
          background: linear-gradient(180deg, rgba(242, 237, 228, 0.04), rgba(242, 237, 228, 0.01));
          overflow: hidden;
        }
        .gauge__fill {
          position: absolute;
          z-index: 1;
          left: 0;
          bottom: 0;
          width: 100%;
          background: linear-gradient(180deg, var(--spec-gold-bright), var(--spec-amber));
          transition: height 1400ms ease-out;
        }
        .gauge__hatch {
          /* Layered above the fill — it marks where every other designer
             EDP tops out, and VELARIO's 35% fill runs straight through it. */
          position: absolute;
          z-index: 2;
          left: 0;
          right: 0;
          background: repeating-linear-gradient(
            45deg,
            rgba(11, 9, 8, 0.55),
            rgba(11, 9, 8, 0.55) 1px,
            transparent 1px,
            transparent 6px
          );
          border-top: 1px solid var(--spec-cream);
          border-bottom: 1px solid var(--spec-cream);
        }
        .gauge__tick {
          position: absolute;
          z-index: 3;
          left: -12px;
          right: -12px;
          height: 0;
          border-top: 1px solid var(--spec-cream);
        }

        /* Sits outside .gauge__column's overflow:hidden so the labels never
           get clipped, but shares the exact same box so its percentages
           still line up with the hatch band and tick line inside it. */
        .gauge__labels {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .gauge__hatch-label {
          position: absolute;
          left: 100%;
          margin-left: 12px;
          transform: translateY(50%);
          width: max-content;
          font-family: var(--font-sans-specimen), sans-serif;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--spec-gold);
          white-space: nowrap;
        }
        .gauge__tick-label {
          position: absolute;
          right: 100%;
          margin-right: 16px;
          transform: translateY(50%);
          width: max-content;
          font-family: var(--font-display-specimen), serif;
          font-weight: 700;
          font-size: 28px;
          color: var(--spec-cream);
          white-space: nowrap;
        }

        /* Mobile: rotate the whole instrument to horizontal, beneath the CTAs */
        .gauge--horizontal {
          width: 100%;
          max-width: 420px;
          height: 64px;
          margin: var(--space-lg, 3.5rem) auto 0;
        }
        .gauge--horizontal .gauge__bottle {
          display: none;
        }
        .gauge--horizontal .gauge__hatch {
          top: 0;
          bottom: 0;
          left: auto;
          right: auto;
          border-top: none;
          border-bottom: none;
          border-left: 1px solid var(--spec-gold);
          border-right: 1px solid var(--spec-gold);
        }
        .gauge--horizontal .gauge__hatch-label {
          /* Centered under the whole instrument, not the hatch band itself —
             on a narrow phone there isn't room to align precisely without
             clipping past the page gutter. */
          left: 50%;
          margin-left: 0;
          top: 100%;
          bottom: auto;
          margin-top: 8px;
          transform: translateX(-50%);
          white-space: normal;
          text-align: center;
          max-width: 100%;
        }
        .gauge--horizontal .gauge__fill {
          bottom: 0;
          top: 0;
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, var(--spec-amber), var(--spec-gold-bright));
          transition: width 1400ms ease-out;
        }
        .gauge--horizontal .gauge__tick {
          top: -12px;
          bottom: -12px;
          left: 0;
          height: auto;
          width: 0;
          border-top: none;
          border-left: 1px solid var(--spec-cream);
        }
        .gauge--horizontal .gauge__tick-label {
          right: auto;
          margin-right: 0;
          left: ${FILL_PCT}%;
          bottom: auto;
          top: 0;
          margin-top: -8px;
          transform: translate(-50%, -100%);
          font-size: 16px;
        }

        @media (prefers-reduced-motion: reduce) {
          .gauge__fill {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
