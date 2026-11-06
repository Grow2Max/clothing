import { NextResponse } from "next/server";
import { supabaseAdmin, rowToCollection } from "@/lib/supabase";
import { paging, searchTerm } from "@/lib/admin-list";

// GET /api/admin/collections?page=1&pageSize=12&q=silk   (all=1 → every collection, for pickers)
export async function GET(req: Request) {
  const { sp, page, pageSize, from, to } = paging(req.url, 12);
  const q = searchTerm(sp.get("q"));
  let query = supabaseAdmin().from("collections").select("*", { count: "exact" }).order("id");
  if (q) query = query.ilike("title", `%${q}%`);
  const { data, count, error } = sp.get("all") === "1" ? await query : await query.range(from, to);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: (data ?? []).map(rowToCollection), total: count ?? 0, page, pageSize });
}
