"use client";

import type { ReactNode } from "react";
import { AmbientCanvas } from "@/components/three/AmbientCanvas";

export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
  webgl = true,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  /** Set false for speed-first pages (e.g. /help) — swaps the WebGL dust field for a pure-CSS animated gradient. */
  webgl?: boolean;
}) {
  return (
    <section className="velario-page-hero">
      {webgl ? <AmbientCanvas particleCount={220} /> : <div className="velario-page-hero__css-bg" aria-hidden />}
      <div className="velario-page-hero__content">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="font-display">{title}</h1>
        {subtitle && <p>{subtitle}</p>}
        {children}
      </div>

      <style jsx>{`
        .velario-page-hero {
          position: relative;
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: calc(var(--letterbox) + var(--space-2xl)) var(--space-lg) var(--space-2xl);
          overflow: hidden;
        }
        .velario-page-hero__content {
          position: relative;
          z-index: 1;
          max-width: 720px;
        }
        .velario-page-hero__content h1 {
          font-size: clamp(2.4rem, 6vw, 4.2rem);
          margin-top: var(--space-sm);
        }
        .velario-page-hero__content p {
          margin-top: var(--space-md);
          color: rgba(245, 244, 240, 0.72);
          font-size: 1.05rem;
          line-height: 1.7;
        }
        .velario-page-hero__css-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          background: radial-gradient(circle at 50% 30%, var(--color-forest), var(--color-obsidian) 70%);
          overflow: hidden;
        }
        .velario-page-hero__css-bg::before {
          content: "";
          position: absolute;
          inset: -20%;
          background: radial-gradient(circle, rgba(197, 160, 89, 0.16), transparent 60%);
          animation: velario-drift-hero 14s ease-in-out infinite alternate;
        }
        @keyframes velario-drift-hero {
          from {
            transform: translate(-6%, -4%) scale(1);
          }
          to {
            transform: translate(6%, 4%) scale(1.15);
          }
        }
      `}</style>
    </section>
  );
}
