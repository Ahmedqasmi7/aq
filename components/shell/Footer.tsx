"use client";

import Link from "next/link";

const CITIES = ["Paris", "Milan", "Tokyo"];

export function Footer() {
  return (
    <footer className="velario-footer">
      <div className="velario-footer__top">
        <div className="velario-footer__brand">
          <span className="font-display velario-footer__mark">VELARIO</span>
          <p className="velario-footer__tagline">The Architecture of Scent.</p>
          <Link href="/about#private-membership" className="velario-footer__cta" data-cursor="hover">
            Private Membership Access →
          </Link>
        </div>

        <div className="velario-footer__col">
          <span className="eyebrow">Flagship Boutiques</span>
          <ul>
            {CITIES.map((city) => (
              <li key={city}>{city}</li>
            ))}
          </ul>
        </div>

        <div className="velario-footer__col">
          <span className="eyebrow">House</span>
          <ul>
            <li><Link href="/why-velario" data-cursor="hover">Why Velario</Link></li>
            <li><Link href="/about" data-cursor="hover">About Us</Link></li>
            <li><Link href="/bundle" data-cursor="hover">Bundles</Link></li>
          </ul>
        </div>

        <div className="velario-footer__col">
          <span className="eyebrow">Client Services</span>
          <ul>
            <li><Link href="/help" data-cursor="hover">Help &amp; FAQ</Link></li>
            <li><Link href="/business-inquiry" data-cursor="hover">Business Inquiries</Link></li>
            <li><Link href="/help#shipping" data-cursor="hover">Shipping &amp; Returns</Link></li>
          </ul>
        </div>
      </div>

      <div className="hairline" />

      <div className="velario-footer__bottom">
        <p>© {new Date().getFullYear()} VELARIO Fragrance House. All rights reserved.</p>
        <p className="velario-footer__archival">Archival composition &amp; digital atelier — VELARIO Studio.</p>
      </div>

      <style jsx global>{`
        .velario-footer {
          position: relative;
          padding: var(--space-2xl) var(--space-lg) var(--space-lg);
          background: var(--color-obsidian);
          border-top: 1px solid var(--color-line);
        }
        .velario-footer__top {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1fr;
          gap: var(--space-lg);
        }
        .velario-footer__mark {
          font-size: 1.6rem;
          letter-spacing: 0.3em;
          display: block;
        }
        .velario-footer__tagline {
          margin-top: var(--space-2xs);
          color: rgba(245, 244, 240, 0.6);
          font-size: 0.85rem;
        }
        .velario-footer__cta {
          display: inline-block;
          margin-top: var(--space-md);
          color: var(--color-gold);
          text-decoration: none;
          font-size: 0.8rem;
          letter-spacing: 0.08em;
          border-bottom: 1px solid var(--color-line);
          padding-bottom: 2px;
          transition: color var(--dur-fast) var(--ease-velario), border-color var(--dur-fast) var(--ease-velario);
        }
        .velario-footer__cta:hover {
          color: var(--color-amber);
          border-color: var(--color-gold);
        }
        .velario-footer__col ul {
          list-style: none;
          margin-top: var(--space-sm);
          display: flex;
          flex-direction: column;
          gap: var(--space-2xs);
          font-size: 0.85rem;
          color: rgba(245, 244, 240, 0.72);
        }
        .velario-footer__col a {
          text-decoration: none;
          color: inherit;
          transition: color var(--dur-fast) var(--ease-velario);
        }
        .velario-footer__col a:hover {
          color: var(--color-gold);
        }
        .velario-footer__bottom {
          margin-top: var(--space-lg);
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: var(--space-xs);
          font-size: 0.72rem;
          color: rgba(245, 244, 240, 0.4);
        }
        @media (max-width: 800px) {
          .velario-footer__top {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </footer>
  );
}
