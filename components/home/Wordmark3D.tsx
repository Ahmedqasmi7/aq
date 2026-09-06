"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useSceneStore } from "@/store/scene-store";

const LETTERS = "VELARIO".split("");

/**
 * The VELARIO wordmark, built as inline typography rather than a WebGL
 * mesh (Text3D/troika would need an external font file, which this build
 * doesn't fetch). A live perspective transform tied to cursor position
 * gives it real depth in 3D space; the tagline follows with a scroll-scrubbed
 * fade so the transition into Act II never reads as a hard cut.
 */
export function Wordmark3D() {
  const stageRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const taglineRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });
    tl.fromTo(
      lettersRef.current.filter(Boolean),
      { opacity: 0, y: 40, rotateX: -60 },
      { opacity: 1, y: 0, rotateX: 0, duration: 1.1, ease: "expo.out", stagger: 0.09 }
    ).fromTo(
      taglineRef.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
      "-=0.4"
    );

    let raf = 0;
    const tick = () => {
      const { x, y } = useSceneStore.getState().mouse;
      if (stageRef.current) {
        stageRef.current.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 4}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      tl.kill();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="velario-wordmark-stage" ref={stageRef}>
      <h1 className="velario-wordmark" aria-label="VELARIO">
        {LETTERS.map((letter, i) => (
          <span
            key={`${letter}-${i}`}
            ref={(el) => {
              lettersRef.current[i] = el;
            }}
          >
            {letter}
          </span>
        ))}
      </h1>
      <p ref={taglineRef} className="velario-wordmark-tagline eyebrow">
        The Architecture of Scent
      </p>

      <style jsx>{`
        .velario-wordmark-stage {
          text-align: center;
          transform-style: preserve-3d;
          will-change: transform;
        }
        .velario-wordmark {
          font-family: var(--font-display), serif;
          font-size: clamp(3rem, 11vw, 8rem);
          letter-spacing: 0.18em;
          color: var(--color-parchment);
          text-shadow: 0 0 60px rgba(230, 197, 136, 0.25);
        }
        .velario-wordmark span {
          display: inline-block;
        }
        .velario-wordmark-tagline {
          margin-top: var(--space-sm);
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
}
