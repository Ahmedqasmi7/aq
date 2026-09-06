import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <PageHero
      eyebrow="404"
      title="This path doesn't exist."
      subtitle="Even the most carefully composed architecture has edges. Let's get you back to the collection."
    >
      <Link href="/" className="velario-btn-primary" data-cursor="hover" style={{ textDecoration: "none", display: "inline-block", width: "auto", padding: "var(--space-xs) var(--space-2xl)", marginTop: "var(--space-lg)" }}>
        Return to VELARIO
      </Link>
    </PageHero>
  );
}
