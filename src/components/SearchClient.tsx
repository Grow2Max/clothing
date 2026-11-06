"use client";
// Instant saree search: results update as you type, every word must match (name, colour,
// fabric, categories), and Category / Type filters narrow the list. The search and
// filters are kept in the page address, so a search can be shared or bookmarked.
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, X, MessageCircle, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { Collection, Product } from "@/lib/types";
import { PAGE_SIZE } from "@/lib/paging";

const SUGGESTIONS = ["Silk", "Cotton", "Wedding", "Pink", "Red", "Party wear"];

/** Lower-case words, with simple plurals folded ("sarees" → "saree"). */
const words = (s: string) =>
  s
    .toLowerCase()
    .split(/[^a-z0-9஀-௿]+/)
    .filter(Boolean)
    .map((w) => (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w));

const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

export function SearchClient({ products, collections, whatsapp }: { products: Product[]; collections: Collection[]; whatsapp: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [cats, setCats] = useState<string[]>(params.get("cat")?.split(",").filter(Boolean) ?? []);
  const [types, setTypes] = useState<string[]>(params.get("type")?.split(",").filter(Boolean) ?? []);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [shown, setShown] = useState(PAGE_SIZE); // results revealed so far (endless scroll)
  const sentinel = useRef<HTMLDivElement>(null);

  // "Type" = the saree's fabric (first tag), e.g. "soft silk", "cotton".
  const typeOptions = useMemo(() => {
    const seen = new Map<string, number>();
    products.forEach((p) => p.tags[0] && seen.set(p.tags[0], (seen.get(p.tags[0]) ?? 0) + 1));
    return Array.from(seen.entries()).sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [products]);

  // Words each saree can be found by.
  const index = useMemo(() => {
    const colTitle = new Map(collections.map((c) => [c.handle, c.title]));
    return products.map((p) => ({
      p,
      words: Array.from(new Set(words([p.title, p.description, ...p.tags, ...p.collections.map((h) => colTitle.get(h) ?? h)].join(" ")))),
    }));
  }, [products, collections]);

  const results = useMemo(() => {
    const qs = words(q);
    return index
      .filter(({ p, words: w }) => {
        if (cats.length && !p.collections.some((c) => cats.includes(c))) return false;
        if (types.length && !types.includes(p.tags[0])) return false;
        // every typed word must match the start of one of the saree's words
        return qs.every((t) => w.some((x) => x.startsWith(t)));
      })
      .map((x) => x.p);
  }, [index, q, cats, types]);

  // New search or filters → start again from the first page.
  useEffect(() => setShown(PAGE_SIZE), [q, cats, types]);
  // Reveal the next page as the visitor nears the bottom.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || shown >= results.length) return;
    const io = new IntersectionObserver((e) => e[0].isIntersecting && setShown((n) => n + PAGE_SIZE), { rootMargin: "800px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [shown, results.length]);

  // Keep the address bar in sync (no page reload).
  useEffect(() => {
    const t = setTimeout(() => {
      const sp = new URLSearchParams();
      if (q.trim()) sp.set("q", q.trim());
      if (cats.length) sp.set("cat", cats.join(","));
      if (types.length) sp.set("type", types.join(","));
      const next = sp.toString();
      if (next !== params.toString()) router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, cats, types]);

  useEffect(() => {
    if (!params.get("q")) inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const activeFilters = cats.length + types.length;
  const clearAll = () => { setQ(""); setCats([]); setTypes([]); inputRef.current?.focus(); };

  const chip = (on: boolean) =>
    `rounded-full border px-4 py-2 text-sm transition ${on ? "border-silk bg-silk text-white" : "border-ink/15 bg-white text-ink hover:border-silk/50"}`;

  const filters = (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark">Category</p>
        <div className="flex flex-wrap gap-2">
          {collections.map((c) => (
            <button key={c.id} type="button" aria-pressed={cats.includes(c.handle)} onClick={() => toggle(cats, setCats, c.handle)} className={chip(cats.includes(c.handle))}>
              {c.title}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark">Type</p>
        <div className="flex flex-wrap gap-2">
          {typeOptions.map((t) => (
            <button key={t} type="button" aria-pressed={types.includes(t)} onClick={() => toggle(types, setTypes, t)} className={chip(types.includes(t))}>
              {titleCase(t)}
            </button>
          ))}
        </div>
      </div>
      {activeFilters > 0 && (
        <button type="button" onClick={() => { setCats([]); setTypes([]); }} className="text-sm font-semibold text-silk hover:underline">
          Clear filters
        </button>
      )}
    </div>
  );

  return (
    <div className="container-x py-10 md:py-14">
      <div className="text-center">
        <h1 className="font-serif text-3xl text-ink md:text-4xl">Find your saree</h1>
        <p className="mt-2 text-ink-soft">Search by name, colour or fabric.</p>
      </div>

      {/* search box */}
      <form
        role="search"
        onSubmit={(e) => { e.preventDefault(); inputRef.current?.blur(); }}
        className="mx-auto mt-6 flex max-w-2xl items-center rounded-full border border-ink/15 bg-white px-5 shadow-soft focus-within:border-silk"
      >
        <Search size={18} className="shrink-0 text-ink-soft" />
        <input
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try “red silk” or “cotton”"
          aria-label="Search sarees"
          className="w-full bg-transparent px-3 py-3.5 text-base outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {q && (
          <button type="button" onClick={() => { setQ(""); inputRef.current?.focus(); }} aria-label="Clear search" className="rounded-full p-1 text-ink-soft hover:text-ink">
            <X size={18} />
          </button>
        )}
      </form>

      {/* suggestions */}
      <div className="mx-auto mt-4 flex max-w-2xl flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" onClick={() => setQ(s)} className="rounded-full bg-petal px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-silk hover:text-white">
            {s}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[260px_1fr]">
        {/* filters: sidebar on desktop, toggle on phones */}
        <aside className="lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            className="flex w-full items-center justify-between rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm font-medium text-ink lg:hidden"
          >
            <span className="flex items-center gap-2"><SlidersHorizontal size={16} /> Filters{activeFilters ? ` (${activeFilters})` : ""}</span>
            <span className="text-silk">{showFilters ? "Hide" : "Show"}</span>
          </button>
          <div className={`${showFilters ? "mt-4 block" : "hidden"} lg:block`}>{filters}</div>
        </aside>

        <div>
          <p className="mb-6 text-sm text-ink-soft" aria-live="polite">
            {results.length === products.length && !q && !activeFilters
              ? `All ${products.length} sarees`
              : `${results.length} ${results.length === 1 ? "saree" : "sarees"} found`}
            {(q || activeFilters > 0) && (
              <button type="button" onClick={clearAll} className="ml-3 font-semibold text-silk hover:underline">Clear all</button>
            )}
          </p>

          {results.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
              {results.slice(0, shown).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="rounded-2xl bg-petal/60 px-6 py-14 text-center">
              <p className="font-serif text-2xl text-ink">No sarees match that yet</p>
              <p className="mx-auto mt-2 max-w-md text-ink-soft">
                Try a simpler word like &ldquo;silk&rdquo; or a colour, or tell us what you&apos;re looking for on WhatsApp.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={clearAll} className="btn-outline">See all sarees</button>
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn-silk"><MessageCircle size={16} /> Ask us on WhatsApp</a>
              </div>
            </div>
          )}
          <div ref={sentinel} className="h-px" aria-hidden="true" />
          <p className="mt-12 text-center text-sm text-ink-soft">
            Prefer to browse? <Link href="/collections/all" className="font-semibold text-silk hover:underline">See all collections</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
