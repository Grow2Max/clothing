"use client";
import Image from "next/image";
import { Star } from "lucide-react";
import type { Testimonial } from "@/lib/types";
import { Reveal } from "./Reveal";

export function Testimonials({ items }: { items: Testimonial[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((t, i) => (
        <Reveal key={t.id} delay={(i % 3) * 0.1}>
          <figure className="flex h-full flex-col rounded-[10px] bg-cream p-6 shadow-soft">
            <div className="mb-3 flex gap-0.5 text-gold">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} size={15} fill={s < t.rating ? "currentColor" : "none"} className={s < t.rating ? "" : "text-ink/20"} />
              ))}
            </div>
            <blockquote className="flex-1 text-sm leading-relaxed text-ink-soft">“{t.text}”</blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              {t.image && (
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <Image src={t.image} alt={t.name} fill className="object-cover" sizes="40px" />
                </div>
              )}
              <span className="text-sm font-semibold text-ink">{t.name}</span>
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}
