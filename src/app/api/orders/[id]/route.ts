import { NextResponse } from "next/server";
import { supabaseAdmin, rowToOrder } from "@/lib/supabase";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const row: Record<string, unknown> = {};
  if (body.status) row.status = body.status;
  const { data, error } = await supabaseAdmin().from("orders").update(row).eq("id", params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: error.code === "PGRST116" ? 404 : 500 });
  return NextResponse.json(rowToOrder(data));
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { error } = await supabaseAdmin().from("orders").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
