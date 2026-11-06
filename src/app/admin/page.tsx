import Link from "next/link";
import { getAllProducts, getCollections, getOrders, money } from "@/lib/data";
import { Package, FolderTree, ShoppingCart, IndianRupee, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [products, collections, orders] = await Promise.all([getAllProducts(), getCollections(), getOrders()]);
  const revenue = orders.reduce((n, o) => n + o.total, 0);
  const pending = orders.filter((o) => o.status === "pending" || o.status === "processing").length;

  const stats = [
    { label: "Revenue", value: money(revenue), icon: IndianRupee, tone: "bg-mint text-mint-deep" },
    { label: "Orders", value: orders.length, icon: ShoppingCart, tone: "bg-amber-100 text-amber-700" },
    { label: "Products", value: products.length, icon: Package, tone: "bg-blue-100 text-blue-700" },
    { label: "Collections", value: collections.length, icon: FolderTree, tone: "bg-rose-100 text-rose-700" },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-soft">Overview of your store performance.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-[12px] border bg-white p-5 shadow-soft">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${s.tone}`}>
              <s.icon size={20} />
            </div>
            <p className="text-2xl font-semibold text-ink">{s.value}</p>
            <p className="text-sm text-ink-soft">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-[12px] border bg-white p-6 shadow-soft lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl text-ink">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-mint-deep hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-ink-soft">
                  <th className="pb-2">Order</th><th className="pb-2">Customer</th><th className="pb-2">Total</th><th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 6).map((o) => (
                  <tr key={o.id} className="border-b last:border-0">
                    <td className="py-3 font-medium text-ink">{o.id}</td>
                    <td className="py-3">{o.customerName}</td>
                    <td className="py-3">{money(o.total)}</td>
                    <td className="py-3"><StatusPill status={o.status} /></td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-ink-soft">No orders yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[12px] border bg-white p-6 shadow-soft">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-xl text-ink"><TrendingUp size={18} /> Quick Stats</h2>
          <ul className="space-y-4 text-sm">
            <li className="flex justify-between"><span className="text-ink-soft">Pending fulfilment</span><span className="font-semibold text-ink">{pending}</span></li>
            <li className="flex justify-between"><span className="text-ink-soft">Avg. order value</span><span className="font-semibold text-ink">{money(orders.length ? Math.round(revenue / orders.length) : 0)}</span></li>
            <li className="flex justify-between"><span className="text-ink-soft">In stock</span><span className="font-semibold text-ink">{products.filter((p) => p.inStock).length}</span></li>
            <li className="flex justify-between"><span className="text-ink-soft">Out of stock</span><span className="font-semibold text-ink">{products.filter((p) => !p.inStock).length}</span></li>
          </ul>
          <Link href="/admin/products" className="btn-gold mt-6 w-full justify-center text-xs">Manage Products</Link>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-indigo-100 text-indigo-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-rose-100 text-rose-700",
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${map[status] ?? "bg-gray-100"}`}>{status}</span>;
}
