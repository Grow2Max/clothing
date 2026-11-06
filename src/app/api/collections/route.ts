import { NextResponse } from "next/server";
import { revalidateCatalog } from "@/lib/revalidate";
import { supabaseAdmin, rowToCollection } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabaseAdmin().from("collections").select("*").order("id");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(rowToCollection));
}

export async function POST(req: Request) {
  const body = await req.json();
  const handle = (body.handle || body.title || "collection").toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const row = {
    id: `c${Date.now()}`,
    handle,
    title: body.title ?? "Untitled",
    image: body.image || "/images/sarees/10317106.jpg",
    description: body.description ?? "",
  };
  const { data, error } = await supabaseAdmin().from("collections").insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateCatalog(); // storefront shows the change immediately
  return NextResponse.json(rowToCollection(data), { status: 201 });
}
