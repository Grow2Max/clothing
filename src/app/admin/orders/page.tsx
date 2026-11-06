"use client";
import { Suspense, useState } from "react";
import { Trash2, ChevronDown, Search, Phone, MessageCircle } from "lucide-react";
import type { Order } from "@/lib/types";
import { money } from "@/lib/format";
import { brand } from "@/lib/brand";
import { Pagination } from "@/components/admin/Pagination";
import { useAdminList } from "@/hooks/useAdminList";

const STATUSES: Order["status"][] = ["pending", "processing", "shipped", "delivered", "cancelled"];
const badge: Record<Order["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  processing: "bg-sky-100 text-sky-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
};

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<p className="text-ink-soft">Loading…</p>}>
      <AdminOrders />
    </Suspense>
  );
}

function AdminOrders() {
  const { data, loading, error, params, setParams, searchText, setSearchText, reload } = useAdminList<Order>("/api/admin/orders", { pageSize: "24" });
  const [open, setOpen] = useState<string | null>(null);

  const setStatus = async (id: string, status: Order["status"]) => {
    const res = await fetch(`/api/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (!res.ok) alert("Could not update the status.");
    reload();
  };
  const del = async (o: Order) => {
    if (!confirm(`Delete order ${o.id}? This can't be undone.`)) return;
    const res = await fetch(`/api/orders/${o.id}`, { method: "DELETE" });
    if (!res.ok) return alert("Could not delete.");
    if (data && data.items.length === 1 && params.page > 1) setParams({ page: params.page - 1 });
    else reload();
  };
  const digits = (p: string) => p.replace(/\D/g, "");

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-ink">Orders</h1>
        <p className="mt-1 text-sm text-ink-soft">{data ? `${data.total} order${data.total === 1 ? "" : "s"}` : "Loading…"}</p>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <label className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-ink/15 bg-white px-3 focus-within:border-silk">
          <Search size={16} className="text-ink-soft" />
          <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Order number, name or mobile…" className="w-full bg-transparent py-2 text-sm outline-none" />
        </label>
        <select value={params.get("status")} onChange={(e) => setParams({ status: e.target.value })} className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm capitalize outline-none focus:border-silk" aria-label="Status">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {error && <p className="mb-4 rounded-lg bg-wine/10 px-4 py-3 text-sm text-wine">{error} <button onClick={reload} className="font-semibold underline">Retry</button></p>}

      <div className={`space-y-3 transition-opacity ${loading && data ? "opacity-60" : ""}`}>
        {!data && loading && Array.from({ length: 6 }, (_, i) => <div key={i} className="h-[72px] animate-pulse rounded-xl bg-sand/50" />)}
        {data?.items.map((o) => (
          <div key={o.id} className="rounded-xl border bg-white shadow-soft">
            <div className="flex cursor-pointer items-center justify-between gap-4 p-4" onClick={() => setOpen(open === o.id ? null : o.id)}>
              <div className="min-w-0">
                <p className="font-medium text-ink">{o.id} <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${badge[o.status]}`}>{o.status}</span></p>
                <p className="truncate text-sm text-ink-soft">{o.customerName} · {o.phone || o.email} · {new Date(o.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden text-sm font-medium text-ink sm:block">{money(o.total)}</span>
                <select
                  value={o.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setStatus(o.id, e.target.value as Order["status"])}
                  className="rounded border border-ink/20 px-2 py-1.5 text-xs capitalize outline-none"
                  aria-label="Change status"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={(e) => { e.stopPropagation(); del(o); }} aria-label="Delete order" className="text-ink-soft hover:text-wine"><Trash2 size={16} /></button>
                <ChevronDown size={18} className={`transition ${open === o.id ? "rotate-180" : ""}`} />
              </div>
            </div>
            {open === o.id && (
              <div className="border-t bg-[#f6f7f5] p-4 text-sm">
                <div className="mb-3 flex flex-wrap gap-2">
                  {o.phone && <a href={`tel:${o.phone}`} className="inline-flex items-center gap-1 rounded-full border bg-white px-3 py-1.5 text-xs"><Phone size={13} /> Call {o.phone}</a>}
                  {o.phone && <a href={`https://wa.me/${digits(o.phone)}?text=${encodeURIComponent(`Hi ${o.customerName}, this is ${brand.name} about your order ${o.id}.`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full border bg-white px-3 py-1.5 text-xs"><MessageCircle size={13} /> WhatsApp</a>}
                </div>
                <p className="mb-2 text-ink-soft"><strong className="text-ink">Placed:</strong> {new Date(o.createdAt).toLocaleString()}</p>
                <p className="mb-3 text-ink-soft"><strong className="text-ink">Address:</strong> {o.address || "Not given (ask on the call)"}</p>
                <ul className="divide-y rounded border bg-white">
                  {o.items.map((it, i) => (
                    <li key={i} className="flex justify-between px-3 py-2">
                      <span>{it.title} <span className="text-ink-soft">× {it.quantity} ({it.size})</span></span>
                      <span>{money(it.price * it.quantity)}</span>
                    </li>
                  ))}
                  <li className="flex justify-between px-3 py-2 font-medium"><span>Total</span><span>{money(o.total)}</span></li>
                </ul>
              </div>
            )}
          </div>
        ))}
        {data && data.items.length === 0 && <p className="rounded-xl border bg-white py-16 text-center text-ink-soft">No orders match these filters.</p>}
      </div>

      {data && (
        <Pagination page={params.page} pageSize={params.pageSize} total={data.total}
          onPage={(page) => { setParams({ page }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          onPageSize={(pageSize) => setParams({ pageSize })} />
      )}
    </div>
  );
}
