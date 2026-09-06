"use client";

import { useRef, useState } from "react";
import { PRODUCTS } from "@/lib/commerce";
import { useCartStore } from "@/store/cart-store";

function MagneticButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null);

  function handleMove(e: React.MouseEvent<HTMLButtonElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  }

  function handleLeave() {
    if (ref.current) ref.current.style.transform = "translate(0, 0)";
  }

  return (
    <button
      ref={ref}
      type="button"
      className="velario-magnetic-btn"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      data-cursor="hover"
    >
      {children}
    </button>
  );
}

export function ActV() {
  const [selected, setSelected] = useState(PRODUCTS[0]);
  const [variantId, setVariantId] = useState(PRODUCTS[0].variants[0].id);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.open);

  const variant = selected.variants.find((v) => v.id === variantId) ?? selected.variants[0];

  function selectProduct(p: (typeof PRODUCTS)[number]) {
    setSelected(p);
    setVariantId(p.variants[0].id);
  }

  function handleAdd() {
    addItem(selected.id, variant.id, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <section className="home-act" id="acquire" style={{ height: "220vh" }}>
      <div className="home-act__sticky" style={{ gap: "var(--space-lg)" }}>
        <span className="eyebrow home-act__index">Act V — Acquisition</span>

        <div className="velario-acquire" style={{ pointerEvents: "auto" }}>
          <div className="velario-acquire__tabs">
            {PRODUCTS.map((p) => (
              <button
                key={p.id}
                type="button"
                id={`acquire-${p.id}`}
                data-cursor="hover"
                className={`velario-acquire__tab ${p.id === selected.id ? "is-active" : ""}`}
                onClick={() => selectProduct(p)}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className="velario-acquire__card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selected.images[0].src} alt={selected.images[0].alt} className="velario-acquire__image" />
            <div className="velario-acquire__details">
              <h2 className="font-display">{selected.name}</h2>
              <p className="velario-acquire__tagline">{selected.tagline}</p>

              <div className="velario-acquire__variants">
                {selected.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    data-cursor="hover"
                    className={`velario-acquire__variant ${v.id === variant.id ? "is-active" : ""}`}
                    onClick={() => setVariantId(v.id)}
                    disabled={v.inventory === "sold-out"}
                  >
                    {v.label} · ${v.price}
                  </button>
                ))}
              </div>

              <p className="velario-acquire__stock">
                {variant.inventory === "in-stock" && "In stock, ships in 2–3 days"}
                {variant.inventory === "low-stock" && "Low stock — going fast"}
                {variant.inventory === "preorder" && "Available for preorder"}
                {variant.inventory === "sold-out" && "Sold out"}
              </p>

              <div className="velario-acquire__row">
                <div className="velario-stepper">
                  <button type="button" data-cursor="hover" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                    −
                  </button>
                  <span>{quantity}</span>
                  <button type="button" data-cursor="hover" onClick={() => setQuantity((q) => q + 1)}>
                    +
                  </button>
                </div>

                <MagneticButton onClick={handleAdd}>
                  {justAdded ? "Added ✓" : "Acquire Flacon"}
                </MagneticButton>
              </div>

              <button type="button" className="velario-acquire__view-bag" onClick={openCart} data-cursor="hover">
                View Bag →
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .velario-acquire {
          width: min(880px, 92vw);
        }
        .velario-acquire__tabs {
          display: flex;
          justify-content: center;
          gap: var(--space-md);
          margin-bottom: var(--space-md);
          flex-wrap: wrap;
        }
        .velario-acquire__tab {
          background: none;
          border: none;
          border-bottom: 1px solid transparent;
          color: rgba(245, 244, 240, 0.5);
          font-family: var(--font-display), serif;
          font-size: 1.1rem;
          padding-bottom: 4px;
          transition: color var(--dur-fast) var(--ease-velario), border-color var(--dur-fast) var(--ease-velario);
        }
        .velario-acquire__tab.is-active {
          color: var(--color-gold);
          border-color: var(--color-gold);
        }
        .velario-acquire__card {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: var(--space-lg);
          background: rgba(5, 5, 5, 0.55);
          border: 1px solid var(--color-line);
          backdrop-filter: blur(8px);
          padding: var(--space-lg);
          text-align: left;
        }
        .velario-acquire__image {
          width: 100%;
          aspect-ratio: 3/4;
          object-fit: cover;
          border: 1px solid var(--color-line);
        }
        .velario-acquire__tagline {
          color: rgba(245, 244, 240, 0.65);
          margin-top: var(--space-2xs);
          font-size: 0.9rem;
        }
        .velario-acquire__variants {
          display: flex;
          gap: var(--space-2xs);
          margin-top: var(--space-md);
          flex-wrap: wrap;
        }
        .velario-acquire__variant {
          border: 1px solid var(--color-line);
          background: none;
          color: var(--color-parchment);
          padding: var(--space-2xs) var(--space-sm);
          font-size: 0.78rem;
        }
        .velario-acquire__variant.is-active {
          border-color: var(--color-gold);
          color: var(--color-gold);
        }
        .velario-acquire__variant:disabled {
          opacity: 0.4;
          text-decoration: line-through;
        }
        .velario-acquire__stock {
          margin-top: var(--space-sm);
          font-size: 0.72rem;
          color: var(--color-amber);
          letter-spacing: 0.04em;
        }
        .velario-acquire__row {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-top: var(--space-md);
        }
        .velario-magnetic-btn {
          background: var(--color-gold);
          color: var(--color-obsidian);
          border: none;
          padding: var(--space-xs) var(--space-lg);
          font-size: 0.82rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          transition: transform 0.15s var(--ease-velario), background var(--dur-fast) var(--ease-velario);
        }
        .velario-magnetic-btn:hover {
          background: var(--color-amber);
        }
        .velario-acquire__view-bag {
          display: block;
          margin-top: var(--space-md);
          background: none;
          border: none;
          color: rgba(245, 244, 240, 0.6);
          font-size: 0.78rem;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        @media (max-width: 640px) {
          .velario-acquire__card {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
