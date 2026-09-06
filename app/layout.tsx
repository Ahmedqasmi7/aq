import type { Metadata, Viewport } from "next";
import { displaySerif, sans } from "./fonts";
import { SiteShell } from "@/components/shell/SiteShell";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.wearvelario.com"),
  title: {
    default: "VELARIO — The Architecture of Scent",
    template: "%s — VELARIO",
  },
  description:
    "VELARIO is an artisanal fragrance house built on value arbitrage: extrait-strength compositions, uncompromising sourcing, and none of the traditional luxury markup.",
  openGraph: {
    title: "VELARIO — The Architecture of Scent",
    description:
      "Artisanal extrait de parfum, engineered to compete with $300+ fragrance houses on substance, not price.",
    siteName: "VELARIO",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${displaySerif.variable} ${sans.variable}`}>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
