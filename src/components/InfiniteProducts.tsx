"use client";
// Endless scrolling: shows the first page from the server, then fetches the next page
// automatically as the visitor nears the bottom — no page numbers or buttons.
import { useCallback, useEffect, useRef, useState } from "react";
import { ProductCard } from "./ProductCard";
import { PAGE_SIZE } from "@/lib/paging";
import type { Product } from "@/lib/types";

export function InfiniteProducts({ initial, total, collection }: { initial: Product[]; total: number; collection: string }) {
  const [items, setItems] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const done = items.length >= total;

  const loadMore = useCallback(async () => {
    if (busy.current || done) return;
    busy.current = true;
    setLoading(true);
    setFailed(false);
    try {
      const res = await fetch(`/api/catalog?collection=${encodeURIComponent(collection)}&offset=${items.length}&limit=${PAGE_SIZE}`);
      if (!res.ok) throw new Error(String(res.status));
      const data: { items: Product[] } = await res.json();
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...data.items.filter((p) => !seen.has(p.id))];
      });
    } catch {
      setFailed(true);
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }, [collection, items.length, done]);

  // Start loading a little before the bottom is reached, so it feels seamless.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || done || failed) return;
    const io = new IntersectionObserver((entries) => entries[0].isIntersecting && loadMore(), { rootMargin: "800px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, done, failed]);

  return (
    <>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => <ProductCard key={p.id} product={p} />)}
        {loading && Array.from({ length: 4 }, (_, i) => (
          <div key={`s${i}`} aria-hidden="true">
            <div className="aspect-[3/4] animate-pulse rounded-lg bg-sand/60" />
            <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-sand/50" />
            <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-sand/40" />
          </div>
        ))}
      </div>
      <div ref={sentinel} className="h-px" aria-hidden="true" />
      {failed && (
        <p className="mt-8 text-center text-sm text-ink-soft">
          Couldn&apos;t load more sarees.{" "}
          <button type="button" onClick={loadMore} className="font-semibold text-silk hover:underline">Try again</button>
        </p>
      )}
    </>
  );
}
