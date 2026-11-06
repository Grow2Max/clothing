"use client";
import { Suspense, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, X, Search, Loader2 } from "lucide-react";
import type { Collection } from "@/lib/types";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Pagination } from "@/components/admin/Pagination";
import { useAdminList } from "@/hooks/useAdminList";

export default function AdminCollectionsPage() {
  return (
    <Suspense fallback={<p className="text-ink-soft">Loading…</p>}>
      <AdminCollections />
    </Suspense>
  );
}

function AdminCollections() {
  const { data, loading, error, params, setParams, searchText, setSearchText, reload } = useAdminList<Collection>("/api/admin/collections", { pageSize: "12" });
  const [editing, setEditing] = useState<Partial<Collection> | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const save = async () => {
    if (!editing) return;
    if (!editing.title?.trim()) return setErr("Please enter a name.");
    setSaving(true);
    setErr("");
    const res = await fetch(editing.id ? `/api/collections/${editing.id}` : "/api/collections", {
      method: editing.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editing, title: editing.title.trim() }),
    });
    setSaving(false);
    if (!res.ok) return setErr((await res.json().catch(() => ({}))).error || "Could not save.");
    setEditing(null);
    reload();
  };
  const del = async (c: Collection) => {
    if (!confirm(`Delete the "${c.title}" collection? Products in it are not deleted.`)) return;
    const res = await fetch(`/api/collections/${c.id}`, { method: "DELETE" });
    if (!res.ok) return alert("Could not delete.");
    if (data && data.items.length === 1 && params.page > 1) setParams({ page: params.page - 1 });
    else reload();
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-ink">Collections</h1>
          <p className="mt-1 text-sm text-ink-soft">{data ? `${data.total} collection${data.total === 1 ? "" : "s"}` : "Loading…"}</p>
        </div>
        <button onClick={() => { setErr(""); setEditing({ title: "", image: "", description: "" }); }} className="btn-gold text-xs"><Plus size={16} /> Add Collection</button>
      </div>

      <label className="mb-5 flex max-w-md items-center gap-2 rounded-lg border border-ink/15 bg-white px-3 focus-within:border-silk">
        <Search size={16} className="text-ink-soft" />
        <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search collections…" className="w-full bg-transparent py-2 text-sm outline-none" />
      </label>

      {error && <p className="mb-4 rounded-lg bg-wine/10 px-4 py-3 text-sm text-wine">{error} <button onClick={reload} className="font-semibold underline">Retry</button></p>}

      <div className={`grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 transition-opacity ${loading && data ? "opacity-60" : ""}`}>
        {!data && loading && Array.from({ length: 8 }, (_, i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-xl bg-sand/50" />)}
        {data?.items.map((c) => (
          <div key={c.id} className="overflow-hidden rounded-xl border bg-white shadow-soft">
            <div className="relative aspect-[4/3] bg-cream">
              {c.image && <Image src={c.image} alt={c.title} fill className="object-cover" sizes="(min-width:1024px) 260px, 45vw" />}
            </div>
            <div className="p-4">
              <p className="font-medium text-ink">{c.title}</p>
              <p className="text-xs text-ink-soft">/collections/{c.handle}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => { setErr(""); setEditing(c); }} aria-label="Edit" className="rounded p-1.5 text-ink-soft hover:bg-mint/40 hover:text-ink"><Pencil size={15} /></button>
                <button onClick={() => del(c)} aria-label="Delete" className="rounded p-1.5 text-ink-soft hover:bg-wine/10 hover:text-wine"><Trash2 size={15} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {data && data.items.length === 0 && <p className="rounded-xl border bg-white py-16 text-center text-ink-soft">No collections found.</p>}

      {data && (
        <Pagination page={params.page} pageSize={params.pageSize} total={data.total}
          onPage={(page) => { setParams({ page }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          onPageSize={(pageSize) => setParams({ pageSize })} />
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-md rounded-[12px] bg-white p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-xl text-ink">{editing.id ? "Edit" : "New"} Collection</h2>
              <button onClick={() => setEditing(null)} aria-label="Close"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <input className="w-full rounded border border-ink/20 px-3 py-2 text-sm outline-none focus:border-silk" placeholder="Name *" value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              <ImageUploader images={editing.image ? [editing.image] : []} multiple={false} onChange={(imgs) => setEditing({ ...editing, image: imgs[0] ?? "" })} />
              <textarea className="w-full rounded border border-ink/20 px-3 py-2 text-sm outline-none focus:border-silk" placeholder="Short description" rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              {err && <p role="alert" className="rounded bg-wine/10 px-3 py-2 text-sm text-wine">{err}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditing(null)} className="btn-outline">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-gold text-xs disabled:opacity-60">
                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
