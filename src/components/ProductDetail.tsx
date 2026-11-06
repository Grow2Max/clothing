"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import type { Product } from "@/lib/types";
import { money } from "@/lib/format";
import { useCart } from "@/lib/cart-store";

export function ProductDetail({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const [size, setSize] = useState(product.sizes[0] ?? "M");
  const [qty, setQty] = useState(1);
  const swipeRef = useRef<HTMLDivElement>(null);
  // Phone gallery: native swipe with snap points; the dots follow the visible photo.
  const onSwipe = () => {
    const el = swipeRef.current;
    if (el) setActive(Math.round(el.scrollLeft / el.clientWidth));
  };
  const goTo = (i: number) => {
    const el = swipeRef.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };
  const add = useCart((s) => s.add);
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;

  const handleAdd = () => {
    add({
      productId: product.id,
      title: product.title,
      price: product.price,
      size,
      quantity: qty,
      image: product.images[0],
    });
  };

  return (
    <div className="container-x grid grid-cols-1 gap-10 py-10 lg:grid-cols-2">
      {/* phone gallery: swipe left/right between photos (no arrows) */}
      <div className="-mx-4 sm:-mx-6 md:hidden">
        <div
          ref={swipeRef}
          onScroll={onSwipe}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
          aria-label={`${product.title} photos`}
        >
          {product.images.map((img, i) => (
            <div key={i} className="relative aspect-[4/5] w-full shrink-0 snap-center bg-cream">
              <Image src={img} alt={i === 0 ? product.title : `${product.title}, photo ${i + 1}`} fill priority={i === 0} className="object-cover" sizes="100vw" />
              {i === 0 && onSale && <span className="absolute left-4 top-4 rounded bg-wine px-3 py-1 text-xs font-bold uppercase text-white">Sale</span>}
            </div>
          ))}
        </div>
        {product.images.length > 1 && (
          <div className="mt-1 flex justify-center">
            {product.images.map((_, i) => (
              // 32px tap area, small dot inside
              <button key={i} onClick={() => goTo(i)} aria-label={`Show photo ${i + 1}`} className="flex h-8 items-center px-1">
                <span className={`block h-2 rounded-full transition-all duration-300 ${active === i ? "w-6 bg-silk" : "w-2 bg-silk/25"}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* desktop gallery: thumbnails + large photo */}
      <div className="hidden gap-4 md:flex md:flex-row">
        <div className="flex gap-3 md:flex-col">
          {product.images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative h-20 w-16 overflow-hidden rounded border-2 ${active === i ? "border-gold" : "border-transparent"}`}
            >
              <Image src={img} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
        <motion.div key={active} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="relative aspect-[4/5] flex-1 overflow-hidden rounded-[8px] bg-cream">
          <Image src={product.images[active]} alt={product.title} fill priority className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" />
          {onSale && <span className="absolute left-4 top-4 rounded bg-wine px-3 py-1 text-xs font-bold uppercase text-white">Sale</span>}
        </motion.div>
      </div>

      {/* info */}
      <div>
        {product.immediateDispatch && (
          <span className="text-xs font-semibold uppercase tracking-wide text-mint-deep">Immediate Dispatch</span>
        )}
        <h1 className="mt-2 font-serif text-3xl text-ink md:text-4xl">{product.title}</h1>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-2xl text-ink">{money(product.price)}</span>
          {onSale && <span className="text-lg text-ink-soft line-through">{money(product.compareAtPrice!)}</span>}
          {onSale && (
            <span className="rounded bg-wine/10 px-2 py-0.5 text-xs font-semibold text-wine">
              Save {money(product.compareAtPrice! - product.price)}
            </span>
          )}
        </div>
        <p className="mt-2 text-xs uppercase tracking-wide text-ink-soft">Tax included. Shipping calculated at checkout.</p>

        {/* size */}
        <div className="mt-8">
          <p className="mb-2 text-sm font-medium text-ink">Size: <span className="text-ink-soft">{size}</span></p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`h-11 min-w-11 rounded border px-3 text-sm transition ${size === s ? "border-ink bg-ink text-white" : "border-ink/30 text-ink hover:border-ink"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* qty + add */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <div className="flex items-center rounded border border-ink/30">
            <button className="px-4 py-3" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus size={15} /></button>
            <span className="w-10 text-center">{qty}</span>
            <button className="px-4 py-3" onClick={() => setQty((q) => q + 1)}><Plus size={15} /></button>
          </div>
          <button onClick={handleAdd} disabled={!product.inStock} className="btn-primary min-w-[200px] flex-1 justify-center py-3.5 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-12">
            {product.inStock ? "Add to Cart" : "Sold Out"}
          </button>
        </div>

        {/* description */}
        <div className="mt-8 border-t pt-8">
          <h3 className="mb-2 font-serif text-lg text-ink">Description</h3>
          <p className="text-sm leading-relaxed text-ink-soft">{product.description}</p>
          {product.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.map((t) => (
                <span key={t} className="rounded-full bg-cream px-3 py-1 text-xs text-ink-soft">{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
