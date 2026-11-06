import { unstable_cache } from "next/cache";
import { supabaseAdmin, rowToProduct, rowToCollection, rowToTestimonial } from "./supabase";
import type { Product } from "./types";
import { seedData } from "./seed-data";

/**
 * Storefront reads are cached on the server so pages open without waiting on the
 * database (each Supabase round-trip is ~150–350 ms). Every admin change calls
 * `revalidateCatalog()` (see lib/revalidate.ts), which clears this cache immediately,
 * so edits still show straight away. The 5-minute expiry is only a safety net.
 */
export const CATALOG_TAG = "catalog";
const cached = <T,>(key: string, fn: () => Promise<T>) =>
  unstable_cache(fn, [key], { tags: [CATALOG_TAG], revalidate: 300 });

// Loaders THROW on a database error, so a failed request is never stored in the cache
// (otherwise one network blip could show empty pages until the cache expires).
const loadProducts = cached("products", async () => {
  const { data, error } = await supabaseAdmin().from("products").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToProduct);
});

const loadCollections = cached("collections", async () => {
  const { data, error } = await supabaseAdmin().from("collections").select("*").order("id");
  if (error) throw error;
  return (data ?? []).map(rowToCollection);
});

const loadTestimonials = cached("testimonials", async () => {
  const { data, error } = await supabaseAdmin().from("testimonials").select("*").order("id");
  if (error) throw error;
  return (data ?? []).map(rowToTestimonial);
});

// DEMO: store details are fictional and come from seed-data, not the database.
const loadSettings = async () => seedData.settings!;

/** Try once more after a short pause; if the database is still unreachable, fall back. */
async function withRetry<T>(load: () => Promise<T>, fallback: T, what: string): Promise<T> {
  try {
    return await load();
  } catch {
    await new Promise((r) => setTimeout(r, 300));
    try {
      return await load();
    } catch (e) {
      console.error(`[data] could not load ${what}:`, e);
      return fallback; // not cached — the next request tries the database again
    }
  }
}

export const getAllProducts = () => withRetry(loadProducts, [] as Product[], "products");
export const getCollections = () => withRetry(loadCollections, [], "collections");
export const getTestimonials = () => withRetry(loadTestimonials, [], "testimonials");
export const getSettings = () => withRetry(loadSettings, seedData.settings!, "settings");

// The catalogue is small, so lookups reuse the one cached list instead of new queries.
export async function getProductByHandle(handle: string) {
  return (await getAllProducts()).find((p) => p.handle === handle) ?? null;
}

export async function getCollectionByHandle(handle: string) {
  return (await getCollections()).find((c) => c.handle === handle) ?? null;
}

export async function getProductsInCollection(handle: string) {
  return (await getAllProducts()).filter((p) => p.collections.includes(handle));
}

/**
 * "You may also like": sarees most similar to `product` — shared categories count most,
 * then the same fabric, then a similar price. Always fills up with other sarees if
 * there are few close matches.
 */
export async function getRelatedProducts(product: Product, limit = 8) {
  const others = (await getAllProducts()).filter((p) => p.id !== product.id && p.inStock);
  const fabric = product.tags[0];
  const score = (p: Product) => {
    const shared = p.collections.filter((c) => product.collections.includes(c)).length;
    const sameFabric = fabric && p.tags[0] === fabric ? 1 : 0;
    const priceGap = Math.abs(p.price - product.price) / Math.max(product.price, 1); // 0 = same price
    return shared * 10 + sameFabric * 4 + Math.max(0, 3 - priceGap * 3);
  };
  return others
    .map((p) => ({ p, s: score(p) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.p);
}

// Orders are admin data and always read live.
export async function getOrders() {
  const { data } = await supabaseAdmin().from("orders").select("*").order("created_at", { ascending: false });
  const { rowToOrder } = await import("./supabase");
  return (data ?? []).map(rowToOrder);
}

export function filterProducts(products: Product[]) {
  return {
    newLaunches: products.filter((p) => p.newLaunch).slice(0, 10),
    exclusiveDrops: products.filter((p) => p.exclusiveDrop).slice(0, 8),
    immediateDispatch: products.filter((p) => p.immediateDispatch).slice(0, 10),
    bestDeals: products.filter((p) => p.bestDeal).slice(0, 10),
    restocked: products.filter((p) => p.restocked).slice(0, 8),
  };
}

export { money } from "./format";
