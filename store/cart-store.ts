"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { trackEvent } from "@/lib/commerce";
import type { CartLine } from "@/lib/types";

type CartState = {
  lines: CartLine[];
  isOpen: boolean;
  discountCode: string | null;
  open: () => void;
  close: () => void;
  toggle: () => void;
  addItem: (productId: string, variantId: string, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  setDiscountCode: (code: string | null) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,
      discountCode: null,

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (productId, variantId, quantity = 1) => {
        const existing = get().lines.find((l) => l.variantId === variantId);
        if (existing) {
          set({
            lines: get().lines.map((l) =>
              l.variantId === variantId ? { ...l, quantity: l.quantity + quantity } : l
            ),
          });
        } else {
          set({ lines: [...get().lines, { productId, variantId, quantity }] });
        }
        trackEvent({ name: "add_to_cart", productId, variantId, quantity });
        set({ isOpen: true });
      },

      removeItem: (variantId) => {
        const line = get().lines.find((l) => l.variantId === variantId);
        set({ lines: get().lines.filter((l) => l.variantId !== variantId) });
        if (line) {
          trackEvent({
            name: "remove_from_cart",
            productId: line.productId,
            variantId: line.variantId,
          });
        }
      },

      setQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set({
          lines: get().lines.map((l) => (l.variantId === variantId ? { ...l, quantity } : l)),
        });
      },

      setDiscountCode: (code) => set({ discountCode: code }),

      clear: () => set({ lines: [], discountCode: null }),
    }),
    {
      name: "velario-cart",
      partialize: (s) => ({ lines: s.lines, discountCode: s.discountCode }),
    }
  )
);
