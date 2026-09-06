import { Cormorant_Garamond, Inter } from "next/font/google";

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
