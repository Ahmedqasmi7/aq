import { SpecimenHero } from "./SpecimenHero";
import { SpecimenMarquee } from "./SpecimenMarquee";
import { SpecimenProofBand } from "./SpecimenProofBand";
import { SpecimenWardrobeGrid } from "./SpecimenWardrobeGrid";

/**
 * The specimen-sheet homepage: the concentration argument as layout
 * (Vignelli grid discipline, Baron scale contrast) instead of the
 * photography-led editorial layout the category has trained customers to
 * discount. Sections 1–4: hero, marquee, proof band, wardrobe grid.
 */
export function SpecimenHome() {
  return (
    <div className="specimen">
      <SpecimenHero />
      <SpecimenMarquee />
      <SpecimenProofBand />
      <SpecimenWardrobeGrid />
    </div>
  );
}
