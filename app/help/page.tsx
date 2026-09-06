import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { FaqAccordion } from "@/components/help/FaqAccordion";
import { BusinessInquiryForm } from "@/components/forms/BusinessInquiryForm";

export const metadata: Metadata = {
  title: "Help & FAQ",
  description: "Shipping, returns, fragrance care, order tracking, and payment — answered.",
};

export default function HelpPage() {
  return (
    <>
      <PageHero
        webgl={false}
        eyebrow="Help"
        title="Everything you need to know."
        subtitle="Search below, or reach out directly — a real person answers every inquiry within two business days."
      />

      <section id="shipping" style={{ padding: "0 var(--space-lg) var(--space-2xl)" }}>
        <FaqAccordion />
      </section>

      <section className="velario-help-contact">
        <span className="eyebrow" style={{ display: "block", textAlign: "center", marginBottom: "var(--space-md)" }}>
          Still Have a Question?
        </span>
        <BusinessInquiryForm />
      </section>

      <style>{`
        .velario-help-contact {
          padding: var(--space-2xl) var(--space-lg);
          background: var(--color-forest);
          border-top: 1px solid var(--color-line);
        }
      `}</style>
    </>
  );
}
