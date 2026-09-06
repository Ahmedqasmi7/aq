import type { ReactNode } from "react";
import { SmoothScroll } from "./SmoothScroll";
import { CustomCursor } from "./CustomCursor";
import { Letterbox } from "./Letterbox";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <SmoothScroll>
      <CustomCursor />
      <Letterbox />
      <Nav />
      <CartDrawer />
      <main>{children}</main>
      <Footer />
    </SmoothScroll>
  );
}
