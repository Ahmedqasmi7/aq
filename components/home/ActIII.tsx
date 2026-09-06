"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const PANELS = [
  {
    title: "The Groves, Before Dawn",
    body: "Bergamot is cut before first light, when the oil sits coldest in the rind. Everything top-note in a VELARIO composition begins in this thirty-minute window.",
  },
  {
    title: "The Orchid, By Hand",
    body: "Midnight Orchid is hand-selected, bloom by bloom, for a narcotic density most houses cut with filler absolute. We don't cut it.",
  },
  {
    title: "The Root, Aged Three Years",
    body: "Vetiver root rests three years before distillation — smoked, dried, and re-hydrated until the base note stops being a scent and starts being a weight.",
  },
];

export function ActIII() {
  const narrationRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (narrationRef.current) {
        const panels = panelRefs.current.filter(Boolean) as HTMLDivElement[];
        gsap.set(panels, { opacity: 0, y: 24 });
        gsap.set(panels[0], { opacity: 1, y: 0 });

        const st = ScrollTrigger.create({
          trigger: narrationRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            const third = 1 / panels.length;
            const active = Math.min(panels.length - 1, Math.floor(self.progress / third));
            panels.forEach((panel, i) => {
              gsap.to(panel, { opacity: i === active ? 1 : 0, y: i === active ? 0 : 24, duration: 0.3 });
            });
          },
        });

        return () => st.kill();
      }
    });

    if (gridRef.current) {
      gsap.fromTo(
        gridRef.current.children,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power2.out",
          stagger: 0.12,
          scrollTrigger: { trigger: gridRef.current, start: "top 80%" },
        }
      );
    }

    return () => ctx.revert();
  }, []);

  return (
    <section className="home-act" style={{ height: "auto" }}>
      <div ref={narrationRef} style={{ height: "220vh", position: "relative" }}>
        <div className="home-act__sticky" style={{ alignItems: "flex-end", textAlign: "right" }}>
          <span className="eyebrow home-act__index" style={{ left: "50%" }}>
            Act III — The Olfactory Descent
          </span>
          <div style={{ position: "relative", width: "100%", maxWidth: 520, marginLeft: "auto" }}>
            {PANELS.map((panel, i) => (
              <div
                key={panel.title}
                ref={(el) => {
                  panelRefs.current[i] = el;
                }}
                className="velario-glass-panel"
                style={{ position: "absolute", right: 0, top: 0, textAlign: "left" }}
              >
                <h3 className="font-display">{panel.title}</h3>
                <p>{panel.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="home-act__lookbook" style={{ padding: "var(--space-2xl) var(--space-lg)", pointerEvents: "auto" }}>
        <p className="eyebrow" style={{ textAlign: "center", marginBottom: "var(--space-md)" }}>
          The Harvest, In Full
        </p>
        <div ref={gridRef} className="velario-lookbook-grid">
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/editorial/the-groves.svg" alt="The bergamot groves at dawn" loading="lazy" />
            <figcaption>The Groves</figcaption>
          </figure>
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/editorial/the-fields.svg" alt="The orchid fields, hand-selected" loading="lazy" />
            <figcaption>The Fields</figcaption>
          </figure>
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/editorial/the-roots.svg" alt="Vetiver root, aged three years" loading="lazy" />
            <figcaption>The Roots</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
