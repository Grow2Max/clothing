"use client";
import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, X, Search, LayoutGrid, List, Loader2 } from "lucide-react";
import type { Collection, Product } from "@/lib/types";
import { money } from "@/lib/format";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Pagination } from "@/components/admin/Pagination";
import { useAdminList } from "@/hooks/useAdminList";

const empty: Partial<Product> = {
  title: "", description: "", price: 0, compareAtPrice: undefined,
  images: [], collections: [], sizes: ["Free Size"], tags: [],
  immediateDispatch: false, bestDeal: false, exclusiveDrop: false,
  restocked: false, newLaunch: true, inStock: true,
};

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<p className="text-ink-soft">Loading…</p>}>
      <AdminProducts />
    </Suspense>
  );
}

function AdminProducts() {
  const list = useAdminList<Product>("/api/admin/products", { pageSize: "24", view: "grid" });
  const { data, loading, error, params, setParams, searchText, setSearchText, reload } = list;
  const view = params.get("view") === "list" ? "list" : "grid";
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    fetch("/api/admin/collections?all=1").then((r) => r.json()).then((d) => setCollections(d.items ?? [])).catch(() => {});
  }, []);

  const del = async (p: Product) => {
    if (!confirm(`Delete "${p.title}"? This can't be undone.`)) return;
    const res = await fetch(`/api/products/${p.id}`, { method: "DELETE" });
    if (!res.ok) return alert("Could not delete. Please try again.");
    // stepping back a page if this was the last item on it
    if (data && data.items.length === 1 && params.page > 1) setParams({ page: params.page - 1 });
    else reload();
  };

  const items = data?.items ?? [];
  const sel = "rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-silk";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-ink">Products</h1>
          <p className="mt-1 text-sm text-ink-soft">{data ? `${data.total} product${data.total === 1 ? "" : "s"}` : "Loading…"}</p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="btn-gold text-xs"><Plus size={16} /> Add Product</button>
      </div>

      {/* toolbar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <label className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-ink/15 bg-white px-3 focus-within:border-silk">
          <Search size={16} className="text-ink-soft" />
          <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search by name…" className="w-full bg-transparent py-2 text-sm outline-none" />
        </label>
        <select value={params.get("collection")} onChange={(e) => setParams({ collection: e.target.value })} className={sel} aria-label="Collection">
          <option value="">All collections</option>
          {collections.map((c) => <option key={c.id} value={c.handle}>{c.title}</option>)}
        </select>
        <select value={params.get("stock")} onChange={(e) => setParams({ stock: e.target.value })} className={sel} aria-label="Stock">
          <option value="">Any stock</option>
          <option value="in">In stock</option>
          <option value="out">Out of stock</option>
        </select>
        <div className="flex overflow-hidden rounded-lg border border-ink/15 bg-white" role="group" aria-label="View">
          {([["grid", LayoutGrid, "Grid"], ["list", List, "List"]] as const).map(([v, Icon, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => setParams({ view: v })}
              aria-pressed={view === v}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm transition ${view === v ? "bg-silk text-white" : "text-ink hover:bg-petal"}`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mb-4 rounded-lg bg-wine/10 px-4 py-3 text-sm text-wine">{error} <button onClick={reload} className="font-semibold underline">Retry</button></p>}

      <div className={`transition-opacity ${loading && data ? "opacity-60" : ""}`}>
        {!data && loading ? (
          <Skeleton view={view} />
        ) : items.length === 0 ? (
          <p className="rounded-xl border bg-white py-16 text-center text-ink-soft">No products match these filters.</p>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {items.map((p) => (
              <div key={p.id} className="group overflow-hidden rounded-xl border bg-white shadow-soft">
                <div className="relative aspect-[3/4] bg-cream">
                  {p.images[0] && (
                    <Image src={p.images[0]} alt="" fill sizes="(min-width:1280px) 190px, (min-width:1024px) 230px, (min-width:640px) 30vw, 45vw" className="object-cover" />
                  )}
                  {!p.inStock && <span className="absolute left-2 top-2 rounded bg-ink/80 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">Out of stock</span>}
                  <div className="absolute right-2 top-2 flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                    <button onClick={() => setEditing(p)} aria-label="Edit" className="rounded-full bg-white/95 p-1.5 text-ink shadow-soft hover:text-silk"><Pencil size={14} /></button>
                    <button onClick={() => del(p)} aria-label="Delete" className="rounded-full bg-white/95 p-1.5 text-ink shadow-soft hover:text-wine"><Trash2 size={14} /></button>
                  </div>
                </div>
                <button type="button" onClick={() => setEditing(p)} className="block w-full p-3 text-left">
                  <p className="line-clamp-2 text-sm font-medium text-ink">{p.title}</p>
                  <p className="mt-1 text-sm text-silk">{money(p.price)}</p>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-white shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-[#f6f7f5] text-left text-xs uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="hidden px-4 py-3 md:table-cell">Collections</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-cream">
                          {p.images[0] && <Image src={p.images[0]} alt="" fill className="object-cover" sizes="40px" />}
                        </div>
                        <span className="font-medium text-ink">{p.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{money(p.price)}</td>
                    <td className="hidden px-4 py-3 text-ink-soft md:table-cell">
                      {p.collections.map((h) => collections.find((c) => c.handle === h)?.title ?? h).join(", ")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${p.inStock ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                        {p.inStock ? "In stock" : "Out"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditing(p)} aria-label="Edit" className="rounded p-1.5 text-ink-soft hover:bg-mint/40 hover:text-ink"><Pencil size={16} /></button>
                        <button onClick={() => del(p)} aria-label="Delete" className="rounded p-1.5 text-ink-soft hover:bg-wine/10 hover:text-wine"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data && (
        <Pagination
          page={params.page}
          pageSize={params.pageSize}
          total={data.total}
          onPage={(page) => { setParams({ page }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          onPageSize={(pageSize) => setParams({ pageSize })}
        />
      )}

      {editing && (
        <ProductModal
          product={editing}
          collections={collections}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload(); }}
        />
      )}
    </div>
  );
}

function Skeleton({ view }: { view: "grid" | "list" }) {
  return view === "grid" ? (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border bg-white">
          <div className="aspect-[3/4] animate-pulse bg-sand/60" />
          <div className="space-y-2 p-3"><div className="h-3 w-3/4 animate-pulse rounded bg-sand/60" /><div className="h-3 w-1/3 animate-pulse rounded bg-sand/50" /></div>
        </div>
      ))}
    </div>
  ) : (
    <div className="space-y-2">{Array.from({ length: 8 }, (_, i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-sand/50" />)}</div>
  );
}

function ProductModal({ product, collections, onClose, onSaved }: {
  product: Partial<Product>; collections: Collection[]; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<Product>>(product);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: keyof Product, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const toggleCol = (h: string) => set("collections", (form.collections ?? []).includes(h) ? (form.collections ?? []).filter((x) => x !== h) : [...(form.collections ?? []), h]);

  const save = async () => {
    if (!form.title?.trim()) return setErr("Please enter a product name.");
    if (!form.price || form.price <= 0) return setErr("Please enter a price above 0.");
    if (form.compareAtPrice !== undefined && form.compareAtPrice <= form.price) return setErr("The original price should be higher than the price (or leave it empty).");
    setSaving(true);
    setErr("");
    const res = await fetch(form.id ? `/api/products/${form.id}` : "/api/products", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, title: form.title.trim() }),
    });
    setSaving(false);
    if (!res.ok) return setErr((await res.json().catch(() => ({}))).error || "Could not save. Please try again.");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[12px] bg-white p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl text-ink">{form.id ? "Edit Product" : "New Product"}</h2>
          <button onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <div className="space-y-3">
          <Field label="Name *"><input value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} className="inp" /></Field>
          <Field label="Description"><textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} rows={3} className="inp" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (₹) *"><input type="number" min={0} value={form.price ?? 0} onChange={(e) => set("price", Number(e.target.value))} className="inp" /></Field>
            <Field label="Original price (₹)"><input type="number" min={0} value={form.compareAtPrice ?? ""} onChange={(e) => set("compareAtPrice", e.target.value ? Number(e.target.value) : undefined)} className="inp" placeholder="For a sale" /></Field>
          </div>
          <Field label="Images">
            <ImageUploader images={form.images ?? []} onChange={(imgs) => set("images", imgs)} />
          </Field>
          <div>
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-soft">Collections</span>
            <div className="flex flex-wrap gap-2">
              {collections.map((c) => {
                const on = (form.collections ?? []).includes(c.handle);
                return (
                  <button key={c.id} type="button" onClick={() => toggleCol(c.handle)} aria-pressed={on}
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${on ? "border-silk bg-silk text-white" : "border-ink/15 text-ink hover:border-silk/50"}`}>
                    {c.title}
                  </button>
                );
              })}
              {collections.length === 0 && <span className="text-xs text-ink-soft">No collections yet.</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type / fabric"><input value={form.tags?.[0] ?? ""} onChange={(e) => set("tags", [e.target.value, ...(form.tags ?? []).slice(1)].filter((t, i) => i > 0 || t))} className="inp" placeholder="soft silk" /></Field>
            <Field label="Sizes"><input value={(form.sizes ?? []).join(", ")} onChange={(e) => set("sizes", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} className="inp" placeholder="Free Size" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            {([["inStock", "In stock"], ["newLaunch", "New arrival"], ["bestDeal", "Special price"], ["restocked", "Back in stock"]] as const).map(([k, label]) => (
              <label key={k} className="flex items-center gap-2 text-sm text-ink-soft">
                <input type="checkbox" checked={!!form[k]} onChange={(e) => set(k, e.target.checked)} /> {label}
              </label>
            ))}
          </div>
          {err && <p role="alert" className="rounded bg-wine/10 px-3 py-2 text-sm text-wine">{err}</p>}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-gold text-xs disabled:opacity-60">
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : "Save"}
          </button>
        </div>
      </div>
      <style jsx global>{`.inp { width:100%; border:1px solid rgba(18,18,18,0.2); border-radius:6px; padding:0.5rem 0.75rem; font-size:0.875rem; outline:none; } .inp:focus { border-color:#8e1b55; }`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-soft">{label}</span>
      {children}
    </label>
  );
}
