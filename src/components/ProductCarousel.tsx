"use client";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function ProductCarousel({ products, autoplay = false }: { products: Product[]; autoplay?: boolean }) {
  const [emblaRef, embla] = useEmblaCarousel(
    { align: "start", loop: true, dragFree: false },
    autoplay ? [Autoplay({ delay: 4000, stopOnInteraction: false })] : []
  );
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!embla) return;
    setCanPrev(embla.canScrollPrev());
    setCanNext(embla.canScrollNext());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    onSelect();
    embla.on("select", onSelect).on("reInit", onSelect);
  }, [embla, onSelect]);

  if (!products.length) return null;

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        {/* Spacing via slide padding (not CSS gap): with loop: true, Embla only keeps the
            gaps even where the list wraps around when the space is part of each slide. */}
        <div className="-ml-4 flex items-stretch md:-ml-6">
          {products.map((p) => (
            <div key={p.id} className="flex min-w-0 shrink-0 grow-0 basis-1/2 pl-4 md:basis-1/3 md:pl-6 lg:basis-1/4">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={() => embla?.scrollPrev()}
        disabled={!canPrev}
        aria-label="Previous"
        className="absolute -left-3 top-[32%] hidden h-10 w-10 items-center justify-center rounded-full bg-white shadow-card transition hover:bg-mint disabled:opacity-30 md:flex"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => embla?.scrollNext()}
        disabled={!canNext}
        aria-label="Next"
        className="absolute -right-3 top-[32%] hidden h-10 w-10 items-center justify-center rounded-full bg-white shadow-card transition hover:bg-mint disabled:opacity-30 md:flex"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
