import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { BundleGrid } from "@/components/bundle/BundleGrid";
import { BuildYourOwnSet } from "@/components/bundle/BuildYourOwnSet";

export const metadata: Metadata = {
  title: "Bundles",
  description: "Curated VELARIO gift sets and a build-your-own configurator, with real cart checkout.",
};

export default function BundlePage() {
  return (
    <>
      <PageHero
        eyebrow="Bundles"
        title="The wardrobe, curated."
        subtitle="Three ways to acquire the full architecture of the house — or build your own."
      />
      <div style={{ padding: "0 0 var(--space-2xl)" }}>
        <BundleGrid />
        <BuildYourOwnSet />
      </div>
    </>
  );
}
