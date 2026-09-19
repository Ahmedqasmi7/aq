import { Bodoni_Moda, Cormorant_Garamond, Inter, Jost } from "next/font/google";

// Primary display serif — headlines, wordmark, editorial copy.
// Falls back to a bundled system stack tuned to matching proportions
// (a Garamond/Georgia lineage) if the Google Fonts fetch fails offline.
export const displaySerif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  fallback: ["Garamond", "Georgia", "Times New Roman", "serif"],
  display: "swap",
});

// Specimen-sheet display face — homepage hero only. Bodoni's extreme
// thick/thin contrast is the whole point: it reads as a type-foundry
// specimen, not a perfume ad.
export const displaySpecimen = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-display-specimen",
  fallback: ["Didot", "Georgia", "Times New Roman", "serif"],
  display: "swap",
});

// Specimen-sheet UI face — homepage hero only.
export const sansSpecimen = Jost({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-sans-specimen",
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],
  display: "swap",
});

// Secondary grotesque — UI chrome, labels, body copy, forms.
export const sans = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],
  display: "swap",
});
