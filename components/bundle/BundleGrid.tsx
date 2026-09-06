"use client";

import { useState } from "react";
import { BUNDLES, getProductById } from "@/lib/commerce";
import { useCartStore } from "@/store/cart-store";

export function BundleGrid() {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState<string | null>(null);

  function handleAdd(bundleId: string) {
    const productId = `bundle-${bundleId}`;
    const product = getProductById(productId);
    if (!product) return;
    addItem(product.id, product.variants[0].id);
    setAdded(bundleId);
    setTimeout(() => setAdded(null), 1200);
  }

  return (
    <div className="velario-bundle-grid">
      {BUNDLES.map((bundle) => (
        <article key={bundle.id} id={bundle.handle} className="velario-bundle-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bundle.image.src} alt={bundle.image.alt} loading="lazy" />
          <div className="velario-bundle-card__body">
            <h3 className="font-display">{bundle.name}</h3>
            <p className="velario-bundle-card__tagline">{bundle.tagline}</p>
            <p className="velario-bundle-card__contents">
              {bundle.productIds
                .map((id) => getProductById(id)?.name)
                .filter(Boolean)
                .join(" · ")}
            </p>
            <p className="velario-bundle-card__desc">{bundle.description}</p>
            <div className="velario-bundle-card__footer">
              <div className="velario-bundle-card__price">
                <span>${bundle.price}</span>
                {bundle.compareAtPrice && <s>${bundle.compareAtPrice}</s>}
              </div>
              <button
                type="button"
                data-cursor="hover"
                className="velario-btn-primary"
                onClick={() => handleAdd(bundle.id)}
              >
                {added === bundle.id ? "Added ✓" : "Add to Bag"}
              </button>
            </div>
          </div>
        </article>
      ))}

      <style jsx>{`
        .velario-bundle-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-lg);
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--space-lg);
        }
        .velario-bundle-card {
          border: 1px solid var(--color-line);
          background: var(--color-forest);
          display: flex;
          flex-direction: column;
        }
        .velario-bundle-card img {
          width: 100%;
          aspect-ratio: 4/3;
          object-fit: cover;
          display: block;
        }
        .velario-bundle-card__body {
          padding: var(--space-md);
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .velario-bundle-card__tagline {
          color: rgba(245, 244, 240, 0.6);
          font-size: 0.88rem;
          margin-top: 2px;
        }
        .velario-bundle-card__contents {
          margin-top: var(--space-sm);
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-gold);
        }
        .velario-bundle-card__desc {
          margin-top: var(--space-sm);
          font-size: 0.85rem;
          line-height: 1.6;
          color: rgba(245, 244, 240, 0.7);
          flex: 1;
        }
        .velario-bundle-card__footer {
          margin-top: var(--space-md);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .velario-bundle-card__price {
          display: flex;
          gap: var(--space-2xs);
          align-items: baseline;
          font-family: var(--font-display), serif;
          font-size: 1.3rem;
          color: var(--color-gold);
        }
        .velario-bundle-card__price s {
          font-size: 0.85rem;
          color: rgba(245, 244, 240, 0.4);
        }
        .velario-bundle-card__footer :global(.velario-btn-primary) {
          width: auto;
          padding: var(--space-2xs) var(--space-md);
        }
        @media (max-width: 900px) {
          .velario-bundle-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
