import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Product, Collection, Testimonial, Order, StoreSettings } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const secretKey = process.env.SUPABASE_SECRET_KEY!;

// Force every Supabase request to bypass Next.js' Data Cache so reads are always
// live (new orders, edited products/settings reflect immediately).
const noStoreFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: "no-store" });

// Browser/public client (anon key) — safe to expose, governed by RLS.
export const supabasePublic: SupabaseClient = createClient(url, anonKey, {
  auth: { persistSession: false },
});

// Server-only admin client (secret key) — bypasses RLS. NEVER import in client code.
export function supabaseAdmin(): SupabaseClient {
  return createClient(url, secretKey, {
    auth: { persistSession: false },
    global: { fetch: noStoreFetch },
  });
}

/* ---------- row <-> model mappers ---------- */

type Row = Record<string, unknown>;

export function rowToProduct(r: Row): Product {
  return {
    id: r.id as string,
    handle: r.handle as string,
    title: r.title as string,
    description: (r.description as string) ?? "",
    price: Number(r.price),
    compareAtPrice: r.compare_at_price == null ? undefined : Number(r.compare_at_price),
    images: (r.images as string[]) ?? [],
    collections: (r.collections as string[]) ?? [],
    sizes: (r.sizes as string[]) ?? [],
    tags: (r.tags as string[]) ?? [],
    immediateDispatch: !!r.immediate_dispatch,
    bestDeal: !!r.best_deal,
    exclusiveDrop: !!r.exclusive_drop,
    restocked: !!r.restocked,
    newLaunch: !!r.new_launch,
    inStock: r.in_stock == null ? true : !!r.in_stock,
    createdAt: (r.created_at as string) ?? new Date().toISOString(),
  };
}

export function productToRow(p: Partial<Product>): Row {
  const row: Row = {};
  if (p.id !== undefined) row.id = p.id;
  if (p.handle !== undefined) row.handle = p.handle;
  if (p.title !== undefined) row.title = p.title;
  if (p.description !== undefined) row.description = p.description;
  if (p.price !== undefined) row.price = p.price;
  if (p.compareAtPrice !== undefined) row.compare_at_price = p.compareAtPrice ?? null;
  if (p.images !== undefined) row.images = p.images;
  if (p.collections !== undefined) row.collections = p.collections;
  if (p.sizes !== undefined) row.sizes = p.sizes;
  if (p.tags !== undefined) row.tags = p.tags;
  if (p.immediateDispatch !== undefined) row.immediate_dispatch = p.immediateDispatch;
  if (p.bestDeal !== undefined) row.best_deal = p.bestDeal;
  if (p.exclusiveDrop !== undefined) row.exclusive_drop = p.exclusiveDrop;
  if (p.restocked !== undefined) row.restocked = p.restocked;
  if (p.newLaunch !== undefined) row.new_launch = p.newLaunch;
  if (p.inStock !== undefined) row.in_stock = p.inStock;
  return row;
}

export function rowToCollection(r: Row): Collection {
  return {
    id: r.id as string,
    handle: r.handle as string,
    title: r.title as string,
    image: (r.image as string) ?? "",
    description: (r.description as string) ?? "",
  };
}

export function rowToTestimonial(r: Row): Testimonial {
  return {
    id: r.id as string,
    name: r.name as string,
    text: r.text as string,
    rating: Number(r.rating ?? 5),
    image: (r.image as string) ?? "",
  };
}

export function rowToOrder(r: Row): Order {
  return {
    id: r.id as string,
    customerName: r.customer_name as string,
    email: r.email as string,
    phone: (r.phone as string) ?? "",
    address: (r.address as string) ?? "",
    items: (r.items as Order["items"]) ?? [],
    total: Number(r.total),
    status: r.status as Order["status"],
    createdAt: (r.created_at as string) ?? new Date().toISOString(),
  };
}

export function rowToSettings(r: Row): StoreSettings {
  return r.data as unknown as StoreSettings;
}
