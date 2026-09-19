"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useMediaQuery } from "./useMediaQuery";

/**
 * Shared entrance animation: opacity + 16px translateY, 800ms,
 * cubic-bezier(0.16, 1, 0.3, 1). Every section entrance on the specimen
 * homepage runs through this — the only exception is the gauge fill, which
 * has its own longer, scroll-scrubbed animation.
 */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  as?: "div" | "section";
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [inView, setInView] = useState(false);
  const visible = reducedMotion || inView;

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={`specimen-reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}

      <style jsx>{`
        .specimen-reveal {
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 800ms cubic-bezier(0.16, 1, 0.3, 1), transform 800ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .specimen-reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </Tag>
  );
}
