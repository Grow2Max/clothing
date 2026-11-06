import { NextResponse } from "next/server";
import { revalidateCatalog } from "@/lib/revalidate";
import { supabaseAdmin, rowToCollection } from "@/lib/supabase";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const row: Record<string, unknown> = {};
  for (const k of ["title", "image", "description"] as const) if (k in body) row[k] = body[k];
  const { data, error } = await supabaseAdmin().from("collections").update(row).eq("id", params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: error.code === "PGRST116" ? 404 : 500 });
  revalidateCatalog(); // storefront shows the change immediately
  return NextResponse.json(rowToCollection(data));
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { error } = await supabaseAdmin().from("collections").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateCatalog(); // storefront shows the change immediately
  return NextResponse.json({ ok: true });
}
