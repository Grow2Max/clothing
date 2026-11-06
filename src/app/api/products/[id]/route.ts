import { NextResponse } from "next/server";
import { revalidateCatalog } from "@/lib/revalidate";
import { supabaseAdmin, rowToProduct, productToRow } from "@/lib/supabase";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const row = productToRow(body);
  delete row.id;
  const { data, error } = await supabaseAdmin().from("products").update(row).eq("id", params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: error.code === "PGRST116" ? 404 : 500 });
  revalidateCatalog(); // storefront shows the change immediately
  return NextResponse.json(rowToProduct(data));
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { error } = await supabaseAdmin().from("products").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateCatalog(); // storefront shows the change immediately
  return NextResponse.json({ ok: true });
}
