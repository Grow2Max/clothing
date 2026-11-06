"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { money } from "@/lib/format";

export function CartDrawer() {
  const { isOpen, close, items, setQty, remove } = useCart();
  const total = useCart((s) => s.total());
  const pathname = usePathname();
  // Restore the saved cart once, after the first render (matches the server HTML).
  useEffect(() => {
    useCart.persist.rehydrate();
  }, []);
  // Close the drawer whenever the page changes (e.g. after tapping Checkout).
  useEffect(() => {
    close();
  }, [pathname, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full w-[420px] max-w-[92vw] flex-col bg-white shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between border-b px-6 py-5">
              <h3 className="font-serif text-xl">Your Cart</h3>
              <button onClick={close} aria-label="Close"><X size={22} /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-ink-soft">
                  <p>Your cart is empty.</p>
                  <button onClick={close} className="btn-outline">Continue shopping</button>
                </div>
              ) : (
                <ul className="space-y-5">
                  {items.map((it) => (
                    <li key={`${it.productId}-${it.size}`} className="flex gap-4">
                      <div className="relative h-24 w-20 overflow-hidden rounded bg-cream">
                        <Image src={it.image} alt={it.title} fill className="object-cover" sizes="80px" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <p className="text-sm font-medium text-ink">{it.title}</p>
                        <p className="text-xs text-ink-soft">Size: {it.size}</p>
                        <p className="text-sm text-ink">{money(it.price)}</p>
                        <div className="mt-auto flex items-center gap-3">
                          <div className="flex items-center rounded border">
                            <button className="px-2 py-1" onClick={() => setQty(it.productId, it.size, it.quantity - 1)}><Minus size={13} /></button>
                            <span className="w-7 text-center text-sm">{it.quantity}</span>
                            <button className="px-2 py-1" onClick={() => setQty(it.productId, it.size, it.quantity + 1)}><Plus size={13} /></button>
                          </div>
                          <button onClick={() => remove(it.productId, it.size)} className="text-ink-soft hover:text-wine"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t px-6 py-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm uppercase tracking-wide text-ink-soft">Subtotal</span>
                  <span className="font-serif text-xl text-ink">{money(total)}</span>
                </div>
                <Link href="/cart" onClick={close} className="btn-gold w-full justify-center">Checkout</Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
