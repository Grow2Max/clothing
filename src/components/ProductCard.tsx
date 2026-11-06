"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { money } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const [loaded, setLoaded] = useState(false);
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group flex h-full w-full flex-col"
    >
      <Link href={`/products/${product.handle}`} className="relative block overflow-hidden rounded-[6px] bg-cream">
        {onSale && (
          <span className="absolute left-3 top-3 z-10 rounded bg-wine px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Sale
          </span>
        )}
        {!product.inStock && (
          <span className="absolute right-3 top-3 z-10 rounded bg-ink/80 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
            Sold out
          </span>
        )}
        <div className="relative aspect-[4/5] w-full">
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            onLoad={() => setLoaded(true)}
            className={`object-cover transition-all duration-700 ease-out group-hover:scale-105 ${loaded ? "opacity-100 blur-0" : "opacity-0 blur-md"}`}
          />
          {product.images[1] && (
            <Image
              src={product.images[1]}
              alt={product.title}
              fill
              sizes="(max-width:768px) 50vw, 25vw"
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
        </div>
      </Link>
      <div className="mt-3 flex flex-1 flex-col gap-1">
        <span className="min-h-[14px] text-[10px] font-semibold uppercase tracking-wide text-mint-deep">
          {product.immediateDispatch ? "Immediate Dispatch" : ""}
        </span>
        <Link href={`/products/${product.handle}`} className="line-clamp-1 text-sm font-medium text-ink hover:underline">
          {product.title}
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm text-ink">{money(product.price)}</span>
          {onSale && <span className="text-xs text-ink-soft line-through">{money(product.compareAtPrice!)}</span>}
        </div>
        <Link
          href={`/products/${product.handle}`}
          className="group/cta mt-auto inline-flex w-fit items-center gap-1.5 pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink transition-colors duration-300 hover:text-mint-deep"
        >
          <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-100 after:bg-current after:transition-transform after:duration-300 group-hover/cta:after:scale-x-0">
            Choose options
          </span>
        </Link>
      </div>
    </motion.div>
  );
}
