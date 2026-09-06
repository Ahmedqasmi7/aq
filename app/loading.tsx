export default function Loading() {
  return (
    <div className="velario-loading" role="status" aria-label="Loading">
      <span className="velario-loading__mark">V</span>
      <style>{`
        .velario-loading {
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .velario-loading__mark {
          font-family: var(--font-display), serif;
          font-size: 2.5rem;
          color: var(--color-gold);
          animation: velario-loading-pulse 1.6s ease-in-out infinite;
        }
        @keyframes velario-loading-pulse {
          0%, 100% { opacity: 0.25; transform: scale(0.96); }
          50% { opacity: 1; transform: scale(1.04); }
        }
      `}</style>
    </div>
  );
}
