"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[velario:error]", error);
  }, [error]);

  return (
    <div className="velario-error-state">
      <span className="eyebrow">Something Went Wrong</span>
      <h1 className="font-display">The composition faltered.</h1>
      <p>An unexpected error interrupted this page. It has been logged — try again.</p>
      <button type="button" onClick={reset} data-cursor="hover">
        Try Again
      </button>

      <style jsx>{`
        .velario-error-state {
          min-height: 70vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: var(--space-xl);
          gap: var(--space-sm);
        }
        .velario-error-state h1 {
          font-size: 2rem;
        }
        .velario-error-state p {
          color: rgba(245, 244, 240, 0.65);
          max-width: 420px;
        }
        .velario-error-state button {
          margin-top: var(--space-md);
          background: var(--color-gold);
          color: var(--color-obsidian);
          border: none;
          padding: var(--space-xs) var(--space-xl);
          font-size: 0.85rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
}
