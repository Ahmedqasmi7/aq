"use client";

import { useEffect, useRef, useState } from "react";
import { useSceneStore } from "@/store/scene-store";

const HOVER_SELECTOR = 'a, button, [role="button"], input, textarea, select, [data-cursor="hover"]';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const setMouse = useSceneStore((s) => s.setMouse);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    setEnabled(!coarse);
    if (coarse) return;

    let ringX = window.innerWidth / 2;
    let ringY = window.innerHeight / 2;
    let targetX = ringX;
    let targetY = ringY;
    let raf = 0;
    let hovering = false;

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      }
      setMouse((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    };

    const onOver = (e: PointerEvent) => {
      const target = e.target as Element | null;
      hovering = Boolean(target?.closest(HOVER_SELECTOR));
      ringRef.current?.classList.toggle("velario-cursor-ring--hover", hovering);
    };

    const tick = () => {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      cancelAnimationFrame(raf);
    };
  }, [setMouse]);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className="velario-cursor-dot" aria-hidden />
      <div ref={ringRef} className="velario-cursor-ring" aria-hidden />
      <style jsx global>{`
        .velario-cursor-dot {
          position: fixed;
          top: 0;
          left: 0;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-amber);
          box-shadow: 0 0 8px 2px rgba(230, 197, 136, 0.7);
          pointer-events: none;
          z-index: 200;
          will-change: transform;
        }
        .velario-cursor-ring {
          position: fixed;
          top: 0;
          left: 0;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid var(--color-gold);
          background: rgba(197, 160, 89, 0.06);
          backdrop-filter: blur(2px);
          pointer-events: none;
          z-index: 199;
          transition: width var(--dur-fast) var(--ease-velario), height var(--dur-fast) var(--ease-velario),
            opacity var(--dur-fast) var(--ease-velario);
          will-change: transform;
        }
        .velario-cursor-ring--hover {
          width: 56px;
          height: 56px;
          background: rgba(197, 160, 89, 0.12);
        }
      `}</style>
    </>
  );
}
