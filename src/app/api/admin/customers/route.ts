import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { paging, searchTerm } from "@/lib/admin-list";

export type CustomerRow = { key: string; name: string; phone: string; email: string; orders: number; spent: number; last: string };

// Customers are built from orders (grouped by mobile number), then paginated.
// GET /api/admin/customers?page=1&pageSize=24&q=priya
export async function GET(req: Request) {
  const { sp, page, pageSize, from } = paging(req.url);
  const q = searchTerm(sp.get("q")).toLowerCase();
  // Only the light columns needed for the summary (no order items).
  const { data, error } = await supabaseAdmin()
    .from("orders")
    .select("customer_name, phone, email, total, created_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const map = new Map<string, CustomerRow>();
  for (const o of data ?? []) {
    const phone = String(o.phone ?? "");
    const email = String(o.email ?? "");
    const key = phone.replace(/\D/g, "").slice(-10) || email.toLowerCase() || String(o.customer_name).toLowerCase();
    const row = map.get(key) ?? { key, name: String(o.customer_name), phone, email, orders: 0, spent: 0, last: String(o.created_at) };
    row.orders += 1;
    row.spent += Number(o.total) || 0;
    if (new Date(String(o.created_at)) > new Date(row.last)) row.last = String(o.created_at);
    map.set(key, row);
  }
  let rows = Array.from(map.values()).sort((a, b) => +new Date(b.last) - +new Date(a.last));
  if (q) rows = rows.filter((r) => `${r.name} ${r.phone} ${r.email}`.toLowerCase().includes(q));
  return NextResponse.json({ items: rows.slice(from, from + pageSize), total: rows.length, page, pageSize });
}
