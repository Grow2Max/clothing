import { NextResponse } from "next/server";
import { revalidateCatalog } from "@/lib/revalidate";
import { supabaseAdmin, rowToProduct, productToRow } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabaseAdmin().from("products").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(rowToProduct));
}

export async function POST(req: Request) {
  const body = await req.json();
  const handle =
    (body.handle || body.title || "product").toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") +
    "-" + Date.now().toString().slice(-4);
  const row = {
    ...productToRow({
      ...body,
      price: Number(body.price) || 0,
      compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : undefined,
      images: body.images?.length ? body.images : ["/images/sarees/10317113.jpg"],
      sizes: body.sizes ?? ["S", "M", "L", "XL"],
      newLaunch: body.newLaunch ?? true,
      inStock: body.inStock ?? true,
    }),
    id: `p${Date.now()}`,
    handle,
  };
  const { data, error } = await supabaseAdmin().from("products").insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateCatalog(); // storefront shows the change immediately
  return NextResponse.json(rowToProduct(data), { status: 201 });
}
