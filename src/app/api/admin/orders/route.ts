import { NextResponse } from "next/server";
import { supabaseAdmin, rowToOrder } from "@/lib/supabase";
import { paging, searchTerm } from "@/lib/admin-list";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

// GET /api/admin/orders?page=1&pageSize=24&status=pending&q=priya
export async function GET(req: Request) {
  const { sp, page, pageSize, from, to } = paging(req.url);
  const q = searchTerm(sp.get("q"));
  let query = supabaseAdmin().from("orders").select("*", { count: "exact" }).order("created_at", { ascending: false });
  const status = sp.get("status");
  if (status && STATUSES.includes(status)) query = query.eq("status", status);
  if (q) query = query.or(`id.ilike.%${q}%,customer_name.ilike.%${q}%,phone.ilike.%${q}%`);
  const { data, count, error } = await query.range(from, to);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: (data ?? []).map(rowToOrder), total: count ?? 0, page, pageSize });
}
