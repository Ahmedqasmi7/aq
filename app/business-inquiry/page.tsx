import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { BusinessInquiryForm } from "@/components/forms/BusinessInquiryForm";

export const metadata: Metadata = {
  title: "Business Inquiries",
  description: "Corporate gifting, wholesale, private label, and press inquiries for VELARIO Fragrance House.",
};

export default function BusinessInquiryPage() {
  return (
    <>
      <PageHero
        eyebrow="Business Inquiries"
        title="Let's build something at scale."
        subtitle="Corporate gifting, wholesale, private label, or press — tell us what you're building and we'll route it to the right desk."
      />
      <div style={{ padding: "0 var(--space-lg) var(--space-2xl)" }}>
        <BusinessInquiryForm />
      </div>
    </>
  );
}
