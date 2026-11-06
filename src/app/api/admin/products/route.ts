import { NextResponse } from "next/server";
import { supabaseAdmin, rowToProduct } from "@/lib/supabase";
import { paging, searchTerm } from "@/lib/admin-list";

// GET /api/admin/products?page=1&pageSize=24&q=silk&collection=cotton&stock=in|out
export async function GET(req: Request) {
  const { sp, page, pageSize, from, to } = paging(req.url);
  const q = searchTerm(sp.get("q"));
  let query = supabaseAdmin().from("products").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (q) query = query.ilike("title", `%${q}%`);
  // collections is a jsonb array, so "contains" needs a JSON value (not a Postgres array)
  const col = (sp.get("collection") ?? "").replace(/[^a-z0-9-]/gi, "");
  if (col) query = query.filter("collections", "cs", JSON.stringify([col]));
  const stock = sp.get("stock");
  if (stock === "in") query = query.eq("in_stock", true);
  if (stock === "out") query = query.eq("in_stock", false);
  const { data, count, error } = await query.range(from, to);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: (data ?? []).map(rowToProduct), total: count ?? 0, page, pageSize });
}
