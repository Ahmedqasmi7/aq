"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { applyDiscountCode, cartSubtotal, checkout, crossSellFor, resolveCartLines } from "@/lib/commerce";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const addItem = useCartStore((s) => s.addItem);
  const discountCode = useCartStore((s) => s.discountCode);
  const setDiscountCode = useCartStore((s) => s.setDiscountCode);

  const [codeInput, setCodeInput] = useState(discountCode ?? "");
  const [codeStatus, setCodeStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [isCheckingOut, startCheckout] = useTransition();
  const router = useRouter();

  const resolved = useMemo(() => resolveCartLines(lines), [lines]);
  const subtotal = useMemo(() => cartSubtotal(resolved), [resolved]);
  const discount = useMemo(
    () => (discountCode ? applyDiscountCode(discountCode, subtotal) : { valid: false, amount: 0 }),
    [discountCode, subtotal]
  );
  const total = Math.max(subtotal - discount.amount, 0);
  const crossSell = resolved.length > 0 ? crossSellFor(resolved[0].productId, 2) : [];

  function handleApplyCode() {
    const result = applyDiscountCode(codeInput, subtotal);
    setDiscountCode(result.valid ? codeInput.trim().toUpperCase() : null);
    setCodeStatus(result.valid ? "valid" : codeInput ? "invalid" : "idle");
  }

  function handleCheckout() {
    startCheckout(async () => {
      const result = await checkout(resolved);
      if (result.mode === "shopify") {
        window.location.href = result.url;
        return;
      }
      close();
      router.push(`/order-confirmation?order=${result.orderId}&total=${result.total.toFixed(2)}`);
    });
  }

  return (
    <>
      <button
        type="button"
        className={`velario-cart-scrim ${isOpen ? "is-open" : ""}`}
        aria-label="Close cart"
        tabIndex={isOpen ? 0 : -1}
        onClick={close}
      />
      <aside className={`velario-cart-drawer ${isOpen ? "is-open" : ""}`} aria-hidden={!isOpen}>
        <div className="velario-cart-drawer__header">
          <span className="eyebrow">Your Bag {resolved.length > 0 ? `(${resolved.length})` : ""}</span>
          <button type="button" onClick={close} aria-label="Close cart" data-cursor="hover">
            ✕
          </button>
        </div>

        {resolved.length === 0 ? (
          <div className="velario-cart-drawer__empty">
            <p className="font-display">Your bag is quiet, for now.</p>
            <p>Every flacon here is built to be worn, not shelved.</p>
            <Link href="/#acquire" onClick={close} data-cursor="hover" className="velario-cart-drawer__empty-cta">
              Discover the Collection →
            </Link>
          </div>
        ) : (
          <>
            <ul className="velario-cart-drawer__lines">
              {resolved.map((line) => (
                <li key={line.variantId} className="velario-cart-line">
                  <div className="velario-cart-line__image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={line.product.images[0].src} alt={line.product.images[0].alt} />
                  </div>
                  <div className="velario-cart-line__info">
                    <p className="velario-cart-line__name">{line.product.name}</p>
                    <p className="velario-cart-line__variant">{line.variant.label}</p>
                    <div className="velario-cart-line__row">
                      <div className="velario-stepper">
                        <button
                          type="button"
                          onClick={() => setQuantity(line.variantId, line.quantity - 1)}
                          aria-label="Decrease quantity"
                          data-cursor="hover"
                        >
                          −
                        </button>
                        <span>{line.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(line.variantId, line.quantity + 1)}
                          aria-label="Increase quantity"
                          data-cursor="hover"
                        >
                          +
                        </button>
                      </div>
                      <span className="velario-cart-line__price">
                        ${(line.variant.price * line.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="velario-cart-line__remove"
                    onClick={() => removeItem(line.variantId)}
                    aria-label={`Remove ${line.product.name} from bag`}
                    data-cursor="hover"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            {crossSell.length > 0 && (
              <div className="velario-cart-drawer__cross-sell">
                <span className="eyebrow">You May Also Wear</span>
                <div className="velario-cross-sell__grid">
                  {crossSell.map((product) => (
                    <div key={product.id} className="velario-cross-sell__item">
                      <div className="velario-cross-sell__image">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={product.images[0].src} alt={product.images[0].alt} />
                      </div>
                      <p>{product.name}</p>
                      <button
                        type="button"
                        data-cursor="hover"
                        onClick={() => addItem(product.id, product.variants[0].id)}
                      >
                        + Add · ${product.variants[0].price}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="velario-cart-drawer__footer">
              <div className="velario-discount">
                <input
                  type="text"
                  placeholder="Discount code"
                  value={codeInput}
                  onChange={(e) => {
                    setCodeInput(e.target.value);
                    setCodeStatus("idle");
                  }}
                />
                <button type="button" onClick={handleApplyCode} data-cursor="hover">
                  Apply
                </button>
              </div>
              {codeStatus === "valid" && <p className="velario-discount__msg is-valid">Code applied.</p>}
              {codeStatus === "invalid" && <p className="velario-discount__msg is-invalid">Code not recognized.</p>}

              <div className="velario-cart-drawer__totals">
                <div className="hairline" />
                {discount.valid && (
                  <div className="velario-cart-drawer__row">
                    <span>Discount</span>
                    <span>−${discount.amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="velario-cart-drawer__row velario-cart-drawer__row--total">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                className="velario-btn-primary"
                onClick={handleCheckout}
                disabled={isCheckingOut}
                data-cursor="hover"
              >
                {isCheckingOut ? "Preparing Checkout…" : "Proceed to Checkout"}
              </button>

              <p className="velario-cart-drawer__trust">
                Secure checkout · Complimentary returns within 30 days · Ships insured, worldwide.
              </p>
            </div>
          </>
        )}
      </aside>

      <style jsx global>{`
        .velario-cart-scrim {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          z-index: 160;
          opacity: 0;
          pointer-events: none;
          transition: opacity var(--dur-med) var(--ease-velario);
          border: none;
        }
        .velario-cart-scrim.is-open {
          opacity: 1;
          pointer-events: auto;
        }
        .velario-cart-drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: min(420px, 92vw);
          background: var(--color-forest);
          border-left: 1px solid var(--color-line);
          z-index: 170;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform var(--dur-med) var(--ease-velario);
          padding: calc(var(--letterbox) + var(--space-md)) 0 var(--space-md);
        }
        .velario-cart-drawer.is-open {
          transform: translateX(0);
        }
        .velario-cart-drawer__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 var(--space-md) var(--space-sm);
          border-bottom: 1px solid var(--color-line);
        }
        .velario-cart-drawer__header button {
          background: none;
          border: none;
          color: var(--color-parchment);
          font-size: 1rem;
        }
        .velario-cart-drawer__empty {
          padding: var(--space-xl) var(--space-md);
          text-align: center;
          color: rgba(245, 244, 240, 0.7);
        }
        .velario-cart-drawer__empty p:first-child {
          font-size: 1.3rem;
          color: var(--color-parchment);
          margin-bottom: var(--space-2xs);
        }
        .velario-cart-drawer__empty-cta {
          display: inline-block;
          margin-top: var(--space-md);
          color: var(--color-gold);
          text-decoration: none;
        }
        .velario-cart-drawer__lines {
          list-style: none;
          overflow-y: auto;
          padding: var(--space-sm) var(--space-md);
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          flex: 1;
        }
        .velario-cart-line {
          display: grid;
          grid-template-columns: 56px 1fr auto;
          gap: var(--space-xs);
          align-items: start;
        }
        .velario-cart-line__image {
          position: relative;
          width: 56px;
          height: 72px;
          background: var(--color-obsidian);
          border: 1px solid var(--color-line);
          overflow: hidden;
        }
        .velario-cart-line__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .velario-cart-line__name {
          font-family: var(--font-display), serif;
          font-size: 1rem;
        }
        .velario-cart-line__variant {
          font-size: 0.75rem;
          color: rgba(245, 244, 240, 0.55);
        }
        .velario-cart-line__row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: var(--space-2xs);
        }
        .velario-stepper {
          display: flex;
          align-items: center;
          gap: var(--space-2xs);
          border: 1px solid var(--color-line);
          padding: 2px var(--space-2xs);
        }
        .velario-stepper button {
          background: none;
          border: none;
          color: var(--color-parchment);
          width: 18px;
        }
        .velario-cart-line__price {
          font-size: 0.85rem;
          color: var(--color-gold);
        }
        .velario-cart-line__remove {
          background: none;
          border: none;
          color: rgba(245, 244, 240, 0.4);
          font-size: 0.68rem;
          letter-spacing: 0.05em;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .velario-cart-line__remove:hover {
          color: var(--color-gold);
        }
        .velario-cart-drawer__cross-sell {
          padding: var(--space-sm) var(--space-md);
          border-top: 1px solid var(--color-line);
        }
        .velario-cross-sell__grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-sm);
          margin-top: var(--space-sm);
        }
        .velario-cross-sell__image {
          position: relative;
          width: 100%;
          aspect-ratio: 3/4;
          background: var(--color-obsidian);
          border: 1px solid var(--color-line);
          overflow: hidden;
        }
        .velario-cross-sell__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .velario-cross-sell__item p {
          font-size: 0.8rem;
          margin-top: var(--space-2xs);
        }
        .velario-cross-sell__item button {
          background: none;
          border: none;
          color: var(--color-gold);
          font-size: 0.72rem;
          margin-top: 2px;
        }
        .velario-cart-drawer__footer {
          padding: var(--space-sm) var(--space-md) 0;
          border-top: 1px solid var(--color-line);
        }
        .velario-discount {
          display: flex;
          gap: var(--space-2xs);
        }
        .velario-discount input {
          flex: 1;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--color-line);
          color: var(--color-parchment);
          padding: var(--space-2xs) var(--space-xs);
          font-size: 0.8rem;
        }
        .velario-discount button {
          border: 1px solid var(--color-gold);
          background: none;
          color: var(--color-gold);
          padding: 0 var(--space-sm);
          font-size: 0.75rem;
        }
        .velario-discount__msg {
          font-size: 0.72rem;
          margin-top: var(--space-2xs);
        }
        .velario-discount__msg.is-valid {
          color: var(--color-amber);
        }
        .velario-discount__msg.is-invalid {
          color: #c97b6a;
        }
        .velario-cart-drawer__totals {
          margin-top: var(--space-sm);
        }
        .velario-cart-drawer__row {
          display: flex;
          justify-content: space-between;
          padding: var(--space-2xs) 0;
          font-size: 0.85rem;
        }
        .velario-cart-drawer__row--total {
          font-size: 1.1rem;
          font-family: var(--font-display), serif;
          color: var(--color-gold);
        }
        .velario-btn-primary {
          width: 100%;
          margin-top: var(--space-sm);
          background: var(--color-gold);
          color: var(--color-obsidian);
          border: none;
          padding: var(--space-xs) 0;
          font-size: 0.85rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          transition: background var(--dur-fast) var(--ease-velario), transform var(--dur-fast) var(--ease-velario);
        }
        .velario-btn-primary:hover:not(:disabled) {
          background: var(--color-amber);
          transform: translateY(-1px);
        }
        .velario-btn-primary:disabled {
          opacity: 0.6;
        }
        .velario-cart-drawer__trust {
          margin-top: var(--space-sm);
          font-size: 0.68rem;
          color: rgba(245, 244, 240, 0.45);
          text-align: center;
        }
      `}</style>
    </>
  );
}
