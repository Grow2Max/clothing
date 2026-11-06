"use client";
import { Suspense } from "react";
import { Phone, Mail, Search, MessageCircle } from "lucide-react";
import { money } from "@/lib/format";
import { Pagination } from "@/components/admin/Pagination";
import { useAdminList } from "@/hooks/useAdminList";
import type { CustomerRow } from "@/app/api/admin/customers/route";

export default function AdminCustomersPage() {
  return (
    <Suspense fallback={<p className="text-ink-soft">Loading…</p>}>
      <AdminCustomers />
    </Suspense>
  );
}

function AdminCustomers() {
  const { data, loading, error, params, setParams, searchText, setSearchText, reload } = useAdminList<CustomerRow>("/api/admin/customers", { pageSize: "24" });
  const digits = (p: string) => p.replace(/\D/g, "");

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-ink">Customers</h1>
        <p className="mt-1 text-sm text-ink-soft">{data ? `${data.total} customer${data.total === 1 ? "" : "s"} (from orders)` : "Loading…"}</p>
      </div>

      <label className="mb-5 flex max-w-md items-center gap-2 rounded-lg border border-ink/15 bg-white px-3 focus-within:border-silk">
        <Search size={16} className="text-ink-soft" />
        <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Name or mobile…" className="w-full bg-transparent py-2 text-sm outline-none" />
      </label>

      {error && <p className="mb-4 rounded-lg bg-wine/10 px-4 py-3 text-sm text-wine">{error} <button onClick={reload} className="font-semibold underline">Retry</button></p>}

      <div className={`overflow-hidden rounded-xl border bg-white shadow-soft transition-opacity ${loading && data ? "opacity-60" : ""}`}>
        <table className="w-full text-sm">
          <thead className="bg-[#f6f7f5] text-left text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="hidden px-4 py-3 md:table-cell">Contact</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Spent</th>
              <th className="hidden px-4 py-3 sm:table-cell">Last order</th>
            </tr>
          </thead>
          <tbody>
            {!data && loading && Array.from({ length: 6 }, (_, i) => (
              <tr key={i} className="border-t"><td colSpan={5} className="px-4 py-3"><div className="h-8 animate-pulse rounded bg-sand/50" /></td></tr>
            ))}
            {data?.items.map((c) => (
              <tr key={c.key} className="border-t">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mint text-sm font-semibold text-mint-deep">{c.name.charAt(0).toUpperCase()}</div>
                    <span className="font-medium text-ink">{c.name}</span>
                  </div>
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <div className="flex flex-col gap-0.5 text-xs text-ink-soft">
                    {c.phone && <span className="flex items-center gap-1"><Phone size={12} /> {c.phone}
                      <a href={`https://wa.me/${digits(c.phone)}`} target="_blank" rel="noopener noreferrer" className="ml-1 text-silk" aria-label="WhatsApp"><MessageCircle size={12} /></a></span>}
                    {c.email && <span className="flex items-center gap-1"><Mail size={12} /> {c.email}</span>}
                  </div>
                </td>
                <td className="px-4 py-3">{c.orders}</td>
                <td className="px-4 py-3 font-medium text-ink">{money(c.spent)}</td>
                <td className="hidden px-4 py-3 text-ink-soft sm:table-cell">{new Date(c.last).toLocaleDateString()}</td>
              </tr>
            ))}
            {data && data.items.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-14 text-center text-ink-soft">No customers yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {data && (
        <Pagination page={params.page} pageSize={params.pageSize} total={data.total}
          onPage={(page) => { setParams({ page }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          onPageSize={(pageSize) => setParams({ pageSize })} />
      )}
    </div>
  );
}
