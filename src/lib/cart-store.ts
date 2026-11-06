"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OrderItem } from "./types";

interface CartState {
  items: OrderItem[];
  isOpen: boolean;
  add: (item: OrderItem) => void;
  remove: (productId: string, size: string) => void;
  setQty: (productId: string, size: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  count: () => number;
  total: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      add: (item) =>
        set((s) => {
          const idx = s.items.findIndex(
            (i) => i.productId === item.productId && i.size === item.size
          );
          if (idx >= 0) {
            const items = [...s.items];
            items[idx] = { ...items[idx], quantity: items[idx].quantity + item.quantity };
            return { items, isOpen: true };
          }
          return { items: [...s.items, item], isOpen: true };
        }),
      remove: (productId, size) =>
        set((s) => ({ items: s.items.filter((i) => !(i.productId === productId && i.size === size)) })),
      setQty: (productId, size, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === productId && i.size === size ? { ...i, quantity: Math.max(1, qty) } : i
          ),
        })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
      total: () => get().items.reduce((n, i) => n + i.price * i.quantity, 0),
    }),
    {
      name: "boutique-cart",
      // Only the items are remembered; the drawer always starts closed on a new page.
      partialize: (s) => ({ items: s.items }),
      // Restore the saved cart only after the page has loaded (see CartDrawer), so the
      // first render matches the server and React doesn't throw hydration errors.
      skipHydration: true,
    }
  )
);
