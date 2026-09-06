"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PRODUCTS } from "@/lib/commerce";
import { useCartStore } from "@/store/cart-store";

const TRAVEL_SIZE = "15ml Travel";

export function BuildYourOwnSet() {
  const [selected, setSelected] = useState<Set<string>>(new Set([PRODUCTS[0].id]));
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const chosen = useMemo(
    () =>
      PRODUCTS.filter((p) => selected.has(p.id)).map((p) => ({
        product: p,
        variant: p.variants.find((v) => v.label === TRAVEL_SIZE) ?? p.variants[0],
      })),
    [selected]
  );

  const total = chosen.reduce((sum, { variant }) => sum + variant.price, 0);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAdd() {
    chosen.forEach(({ product, variant }) => addItem(product.id, variant.id));
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="velario-configurator">
      <h2 className="font-display velario-configurator__title">Build Your Own Set</h2>
      <p className="velario-configurator__intro">
        Choose any combination of travel-sized flacons. Priced individually, added together.
      </p>

      <div className="velario-configurator__options">
        {PRODUCTS.map((p) => {
          const variant = p.variants.find((v) => v.label === TRAVEL_SIZE) ?? p.variants[0];
          const active = selected.has(p.id);
          return (
            <button
              key={p.id}
              type="button"
              data-cursor="hover"
              className={`velario-configurator__option ${active ? "is-active" : ""}`}
              onClick={() => toggle(p.id)}
              aria-pressed={active}
            >
              <span>{p.name}</span>
              <span>${variant.price}</span>
            </button>
          );
        })}
      </div>

      <div className="velario-configurator__footer">
        <div>
          <span className="eyebrow">Set Total</span>
          <p className="font-display velario-configurator__total">${total.toFixed(2)}</p>
        </div>
        <button
          type="button"
          className="velario-btn-primary"
          data-cursor="hover"
          disabled={chosen.length === 0}
          onClick={handleAdd}
        >
          {added ? "Added ✓" : "Add Set to Bag"}
        </button>
      </div>

      <p className="velario-configurator__wholesale">
        Ordering for a team or an event? <Link href="/business-inquiry" data-cursor="hover">Talk to us about bulk pricing →</Link>
      </p>

      <style jsx>{`
        .velario-configurator {
          max-width: 640px;
          margin: var(--space-2xl) auto 0;
          padding: var(--space-lg);
          border: 1px solid var(--color-line);
          background: rgba(14, 20, 17, 0.4);
        }
        .velario-configurator__title {
          font-size: 1.6rem;
          text-align: center;
        }
        .velario-configurator__intro {
          text-align: center;
          color: rgba(245, 244, 240, 0.65);
          font-size: 0.9rem;
          margin-top: var(--space-2xs);
        }
        .velario-configurator__options {
          display: flex;
          flex-direction: column;
          gap: var(--space-2xs);
          margin-top: var(--space-lg);
        }
        .velario-configurator__option {
          display: flex;
          justify-content: space-between;
          border: 1px solid var(--color-line);
          background: none;
          color: var(--color-parchment);
          padding: var(--space-sm);
          font-family: var(--font-display), serif;
          font-size: 1rem;
        }
        .velario-configurator__option.is-active {
          border-color: var(--color-gold);
          color: var(--color-gold);
          background: rgba(197, 160, 89, 0.08);
        }
        .velario-configurator__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: var(--space-lg);
        }
        .velario-configurator__total {
          font-size: 1.6rem;
          color: var(--color-gold);
        }
        .velario-configurator__footer :global(.velario-btn-primary) {
          width: auto;
          padding: var(--space-xs) var(--space-lg);
        }
        .velario-configurator__footer :global(.velario-btn-primary:disabled) {
          opacity: 0.4;
        }
        .velario-configurator__wholesale {
          margin-top: var(--space-md);
          text-align: center;
          font-size: 0.8rem;
          color: rgba(245, 244, 240, 0.55);
        }
        .velario-configurator__wholesale a {
          color: var(--color-gold);
        }
      `}</style>
    </div>
  );
}
