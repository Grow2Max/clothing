import { NextResponse } from "next/server";
import { supabaseAdmin, rowToOrder } from "@/lib/supabase";
import { getAllProducts } from "@/lib/data";
import { normalizeIndianMobile, validateCheckout } from "@/lib/order-validation";
import type { OrderItem } from "@/lib/types";

export async function GET() {
  const { data, error } = await supabaseAdmin().from("orders").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(rowToOrder));
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const fields = {
    customerName: String(body.customerName ?? ""),
    phone: String(body.phone ?? ""),
    address: String(body.address ?? ""),
  };
  const errors = validateCheckout(fields);
  if (Object.keys(errors).length) return NextResponse.json({ error: "Please check the form", errors }, { status: 400 });

  // Rebuild the items from the real catalogue: prices and titles can't be changed by the browser.
  const catalog = new Map((await getAllProducts()).map((p) => [p.id, p]));
  const raw: unknown[] = Array.isArray(body.items) ? body.items : [];
  const items: OrderItem[] = [];
  for (const it of raw) {
    const r = it as Partial<OrderItem>;
    const p = r.productId ? catalog.get(String(r.productId)) : undefined;
    const qty = Math.floor(Number(r.quantity));
    if (!p || !p.inStock || !Number.isFinite(qty) || qty < 1 || qty > 20) continue;
    items.push({ productId: p.id, title: p.title, price: p.price, size: String(r.size ?? p.sizes[0] ?? "Free Size"), quantity: qty, image: p.images[0] ?? "" });
  }
  if (!items.length) return NextResponse.json({ error: "Your cart is empty or the items are no longer available." }, { status: 400 });

  const row = {
    id: `ORD-${Date.now().toString().slice(-6)}`,
    customer_name: fields.customerName.trim(),
    email: "", // not collected
    phone: normalizeIndianMobile(fields.phone)!,
    address: fields.address.trim(),
    items,
    total: items.reduce((n, i) => n + i.price * i.quantity, 0),
    status: "pending",
  };
  const { data, error } = await supabaseAdmin().from("orders").insert(row).select().single();
  if (error) return NextResponse.json({ error: "Sorry, we couldn't place your order. Please try again." }, { status: 500 });
  return NextResponse.json(rowToOrder(data), { status: 201 });
}
