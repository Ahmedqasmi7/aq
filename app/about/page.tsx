import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "About Us",
  description: "The founding story, timeline, and team behind VELARIO Fragrance House.",
};

const TIMELINE = [
  { year: "2021", label: "First composition, Santal Noir, blended in a rented lab in Grasse." },
  { year: "2022", label: "VELARIO incorporated. First 500-unit run sells out in eleven days, direct-to-consumer." },
  { year: "2023", label: "Nocturne and Aether Bloom complete the flagship trio. Extrait-strength becomes the house standard." },
  { year: "2025", label: "Private membership program opens; boutique presence begins in Paris, Milan, and Tokyo." },
];

const TEAM = [
  { initials: "EV", name: "Founder & Nose", role: "Composition & Sourcing" },
  { initials: "MR", name: "Creative Director", role: "Brand & Art Direction" },
  { initials: "SK", name: "Head of Operations", role: "Production & Logistics" },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="Built by people who were tired of the markup."
        subtitle="VELARIO started as a rejection of an industry that charges for heritage it doesn't have and sourcing it won't disclose. Three years later, it's a house."
      />

      <section className="velario-timeline">
        <h2 className="font-display velario-section-title">Founding Timeline</h2>
        <ol>
          {TIMELINE.map((item) => (
            <li key={item.year}>
              <span className="eyebrow">{item.year}</span>
              <p>{item.label}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="velario-team">
        <h2 className="font-display velario-section-title">The Team</h2>
        <div className="velario-team__grid">
          {TEAM.map((member) => (
            <div key={member.initials} className="velario-team__card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/images/about/monogram-${member.initials.toLowerCase()}.svg`} alt={`${member.name} monogram`} />
              <p className="font-display velario-team__name">{member.name}</p>
              <p className="velario-team__role">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="private-membership" className="velario-glass-panel velario-membership">
        <h2 className="font-display">Private Membership</h2>
        <p>
          Members receive early access to limited compositions, invitations to the Paris, Milan, and Tokyo
          boutiques, and a standing archive discount. Membership is by application —{" "}
          <a href="/business-inquiry" data-cursor="hover">reach out here</a>.
        </p>
      </section>

      <style>{`
        .velario-section-title {
          text-align: center;
          font-size: 1.9rem;
          margin-bottom: var(--space-lg);
        }
        .velario-timeline {
          max-width: 720px;
          margin: 0 auto;
          padding: var(--space-2xl) var(--space-lg);
        }
        .velario-timeline ol {
          list-style: none;
          border-left: 1px solid var(--color-line);
        }
        .velario-timeline li {
          position: relative;
          padding: 0 0 var(--space-lg) var(--space-lg);
        }
        .velario-timeline li::before {
          content: "";
          position: absolute;
          left: -4.5px;
          top: 4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-gold);
        }
        .velario-timeline p {
          margin-top: var(--space-2xs);
          color: rgba(245, 244, 240, 0.75);
        }
        .velario-team {
          padding: var(--space-2xl) var(--space-lg);
          background: var(--color-forest);
        }
        .velario-team__grid {
          max-width: 900px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-lg);
          text-align: center;
        }
        .velario-team__card img {
          width: 140px;
          height: 140px;
          margin: 0 auto;
          border-radius: 50%;
          object-fit: cover;
        }
        .velario-team__name {
          margin-top: var(--space-sm);
        }
        .velario-team__role {
          font-size: 0.8rem;
          color: rgba(245, 244, 240, 0.55);
          margin-top: 2px;
        }
        .velario-membership {
          max-width: 720px;
          margin: var(--space-2xl) auto;
          text-align: center;
        }
        .velario-membership a {
          color: var(--color-gold);
        }
        @media (max-width: 700px) {
          .velario-team__grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
