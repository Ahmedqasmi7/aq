import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Why Velario",
  description:
    "The case against traditional luxury fragrance markup, and how VELARIO sources, crafts, and prices differently.",
};

const PILLARS = [
  {
    title: "Sourcing, Without the Middlemen",
    body: "Every raw material is bought direct from grower or distiller — no aggregator, no house-brand markup layered on top. The bergamot is the same fruit the $400 houses use. We just didn't add four hands' worth of margin between the grove and the flacon.",
  },
  {
    title: "The Case Against Price-Gouging",
    body: "Traditional luxury fragrance prices for the box, the campaign, and the name — not the liquid. A $50 bottle of juice routinely sells for $300 once it's wrapped in heritage marketing. VELARIO spends on concentration and sourcing instead, and prices accordingly.",
  },
  {
    title: "The Craftsmanship Standard",
    body: "Every composition ships at extrait de parfum concentration — 20-30% aromatic compounds, well above the eau de parfum standard most 'luxury' houses actually use. Longevity and projection aren't a marketing claim here; they're a specification.",
  },
  {
    title: "Sustainability Commitments",
    body: "Glass flacons are weighted for refill, not for landfill. Ingredients are sourced from growers audited for fair labor practices. We publish our sourcing list on request — no house we compete with does.",
  },
];

export default function WhyVelarioPage() {
  return (
    <>
      <PageHero
        eyebrow="Why Velario"
        title="Substance, priced honestly."
        subtitle="Luxury fragrance has spent a century charging for the story. We decided to charge for the composition instead."
      />

      <section className="velario-pillars">
        {PILLARS.map((pillar) => (
          <div key={pillar.title} className="velario-glass-panel velario-pillars__item">
            <h3 className="font-display">{pillar.title}</h3>
            <p>{pillar.body}</p>
          </div>
        ))}
      </section>

      <section className="velario-cta-band">
        <h2 className="font-display">Ready to wear the difference?</h2>
        <Link href="/bundle" className="velario-btn-primary" data-cursor="hover">
          Explore the Bundles
        </Link>
      </section>

      <style>{`
        .velario-pillars {
          max-width: 1000px;
          margin: 0 auto;
          padding: var(--space-2xl) var(--space-lg);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-lg);
        }
        .velario-pillars__item {
          max-width: none;
        }
        .velario-cta-band {
          text-align: center;
          padding: var(--space-2xl) var(--space-lg) var(--space-2xl);
          border-top: 1px solid var(--color-line);
        }
        .velario-cta-band h2 {
          font-size: 2rem;
          margin-bottom: var(--space-md);
        }
        .velario-cta-band .velario-btn-primary {
          display: inline-block;
          text-decoration: none;
          width: auto;
          padding: var(--space-xs) var(--space-xl);
        }
        @media (max-width: 800px) {
          .velario-pillars {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
