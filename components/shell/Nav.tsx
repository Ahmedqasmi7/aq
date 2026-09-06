"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import { ambientSound } from "@/lib/ambient-sound";
import { MenuOverlay } from "./MenuOverlay";

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const itemCount = useCartStore((s) => s.lines.reduce((sum, l) => sum + l.quantity, 0));
  const openCart = useCartStore((s) => s.open);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="velario-nav">
        <Link href="/" className="velario-nav__mark" data-cursor="hover" aria-label="VELARIO — Home">
          VELARIO
        </Link>

        <div className="velario-nav__actions">
          <button
            type="button"
            data-cursor="hover"
            className="velario-nav__icon-btn"
            aria-pressed={soundOn}
            aria-label={soundOn ? "Mute ambient sound" : "Play ambient sound"}
            onClick={() => setSoundOn(ambientSound.toggle())}
          >
            {soundOn ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d="M3 9v6h4l5 5V4L7 9H3z" />
                <path d="M16 8a5 5 0 010 8" />
                <path d="M19 5a9 9 0 010 14" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d="M3 9v6h4l5 5V4L7 9H3z" />
                <path d="M16 9l5 6M21 9l-5 6" />
              </svg>
            )}
          </button>

          <button
            type="button"
            data-cursor="hover"
            className="velario-nav__icon-btn velario-nav__cart"
            aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
            onClick={openCart}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
              <path d="M6 8h12l-1.2 11.2a2 2 0 01-2 1.8H9.2a2 2 0 01-2-1.8L6 8z" />
              <path d="M9 8V6a3 3 0 016 0v2" />
            </svg>
            {itemCount > 0 && <span className="velario-nav__badge">{itemCount}</span>}
          </button>

          <button
            type="button"
            data-cursor="hover"
            className="velario-nav__icon-btn velario-nav__menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className={`velario-burger ${menuOpen ? "is-open" : ""}`}>
              <span />
              <span />
            </span>
          </button>
        </div>
      </header>

      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />

      <style jsx global>{`
        .velario-nav {
          position: fixed;
          top: var(--letterbox);
          left: 0;
          right: 0;
          z-index: 90;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-sm) var(--space-lg);
          pointer-events: none;
        }
        .velario-nav > * {
          pointer-events: auto;
        }
        .velario-nav__mark {
          font-family: var(--font-display), serif;
          font-size: 1.15rem;
          letter-spacing: 0.32em;
          color: var(--color-parchment);
          text-decoration: none;
          transition: color var(--dur-fast) var(--ease-velario);
        }
        .velario-nav__mark:hover {
          color: var(--color-gold);
        }
        .velario-nav__actions {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }
        .velario-nav__icon-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: transparent;
          border: 1px solid transparent;
          color: var(--color-parchment);
          transition: border-color var(--dur-fast) var(--ease-velario), color var(--dur-fast) var(--ease-velario);
        }
        .velario-nav__icon-btn:hover {
          border-color: var(--color-line);
          color: var(--color-gold);
        }
        .velario-nav__badge {
          position: absolute;
          top: 2px;
          right: 2px;
          min-width: 15px;
          height: 15px;
          padding: 0 3px;
          border-radius: 50%;
          background: var(--color-gold);
          color: var(--color-obsidian);
          font-size: 0.62rem;
          line-height: 15px;
          text-align: center;
          font-family: var(--font-sans), sans-serif;
        }
        .velario-burger {
          display: flex;
          flex-direction: column;
          gap: 5px;
          width: 18px;
        }
        .velario-burger span {
          display: block;
          height: 1px;
          background: currentColor;
          transition: transform var(--dur-fast) var(--ease-velario), opacity var(--dur-fast) var(--ease-velario);
        }
        .velario-burger.is-open span:first-child {
          transform: translateY(3px) rotate(45deg);
        }
        .velario-burger.is-open span:last-child {
          transform: translateY(-3px) rotate(-45deg);
        }
      `}</style>
    </>
  );
}
