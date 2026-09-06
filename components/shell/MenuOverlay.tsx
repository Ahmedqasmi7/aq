"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { PRODUCTS, BUNDLES } from "@/lib/commerce";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Why Velario", href: "/why-velario" },
  { label: "About Us", href: "/about" },
  { label: "Bundles", href: "/bundle" },
  { label: "Business Inquiries", href: "/business-inquiry" },
  { label: "Help", href: "/help" },
];

export function MenuOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    const productHits = PRODUCTS.filter((p) => p.name.toLowerCase().includes(q)).map((p) => ({
      label: p.name,
      href: `/#acquire-${p.id}`,
      kind: "Fragrance",
    }));
    const bundleHits = BUNDLES.filter((b) => b.name.toLowerCase().includes(q)).map((b) => ({
      label: b.name,
      href: `/bundle#${b.handle}`,
      kind: "Bundle",
    }));
    return [...productHits, ...bundleHits];
  }, [query]);

  useEffect(() => {
    if (!rootRef.current) return;
    if (open) {
      gsap.set(rootRef.current, { display: "flex" });
      gsap.fromTo(rootRef.current, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power2.out" });
      gsap.fromTo(
        linksRef.current.filter(Boolean),
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.7, ease: "expo.out", stagger: 0.07, delay: 0.15 }
      );
    } else {
      gsap.to(rootRef.current, {
        opacity: 0,
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => gsap.set(rootRef.current, { display: "none" }),
      });
    }
  }, [open]);

  return (
    <div ref={rootRef} className="velario-menu" style={{ display: "none" }} role="dialog" aria-modal="true">
      <div className="velario-menu__search">
        <input
          type="search"
          placeholder="Search fragrances, bundles…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search products"
        />
        <div className="hairline" />
        {results.length > 0 && (
          <ul className="velario-menu__results">
            {results.map((r) => (
              <li key={r.href}>
                <Link href={r.href} onClick={onClose} data-cursor="hover">
                  <span>{r.label}</span>
                  <span className="eyebrow">{r.kind}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <nav className="velario-menu__links">
        {LINKS.map((link, i) => (
          <div key={link.href} className="velario-menu__link-mask">
            <Link
              ref={(el) => {
                linksRef.current[i] = el;
              }}
              href={link.href}
              onClick={onClose}
              data-cursor="hover"
            >
              {link.label}
            </Link>
          </div>
        ))}
      </nav>

      <style jsx global>{`
        .velario-menu {
          position: fixed;
          inset: 0;
          z-index: 150;
          background: rgba(5, 5, 5, 0.97);
          backdrop-filter: blur(6px);
          display: none;
          flex-direction: column;
          justify-content: center;
          padding: calc(var(--letterbox) + var(--space-xl)) var(--space-lg);
          gap: var(--space-xl);
        }
        .velario-menu__search input {
          width: 100%;
          max-width: 480px;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--color-line);
          color: var(--color-parchment);
          font-family: var(--font-display), serif;
          font-size: 1.4rem;
          padding: var(--space-xs) 0;
          outline: none;
        }
        .velario-menu__search input::placeholder {
          color: rgba(245, 244, 240, 0.35);
        }
        .velario-menu__results {
          list-style: none;
          margin-top: var(--space-sm);
          max-width: 480px;
        }
        .velario-menu__results a {
          display: flex;
          justify-content: space-between;
          padding: var(--space-2xs) 0;
          text-decoration: none;
          color: var(--color-parchment);
        }
        .velario-menu__results a:hover {
          color: var(--color-gold);
        }
        .velario-menu__links {
          display: flex;
          flex-direction: column;
          gap: var(--space-2xs);
        }
        .velario-menu__link-mask {
          overflow: hidden;
        }
        .velario-menu__links a {
          display: inline-block;
          font-family: var(--font-display), serif;
          font-size: clamp(2rem, 6vw, 4rem);
          text-decoration: none;
          color: var(--color-parchment);
          transition: color var(--dur-fast) var(--ease-velario);
        }
        .velario-menu__links a:hover {
          color: var(--color-gold);
        }
      `}</style>
    </div>
  );
}
