/**
 * Seed the Supabase database with the sample saree catalogue from src/lib/seed-data.ts.
 *
 *   npx tsx --env-file=.env.local scripts/seed-supabase.ts
 *       adds/updates the sample collections and products (nothing is deleted)
 *
 *   npx tsx --env-file=.env.local scripts/seed-supabase.ts --replace-catalog
 *       ALSO deletes every product, collection and review that is not in the sample
 *       data — only use this to reset the catalogue (it removes products added in admin).
 *
 * Store settings are only written if none exist yet, so admin edits are never overwritten.
 */
import { createClient } from "@supabase/supabase-js";
import { products, collections, testimonials, seedData } from "../src/lib/seed-data";
import { productToRow } from "../src/lib/supabase";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const secret = process.env.SUPABASE_SECRET_KEY!;
const db = createClient(url, secret, { auth: { persistSession: false } });
const replace = process.argv.includes("--replace-catalog");

async function check<T extends { error: unknown }>(p: PromiseLike<T>) {
  const r = await p;
  if (r.error) throw r.error;
  return r;
}

/** Delete rows whose id is not in `keep` (or every row when `keep` is empty). */
async function prune(table: string, keep: string[]) {
  const q = db.from(table).delete({ count: "exact" });
  const r = await check(keep.length ? q.not("id", "in", `(${keep.map((k) => `"${k}"`).join(",")})`) : q.neq("id", ""));
  console.log(`  removed ${r.count ?? 0} old row(s) from ${table}`);
}

async function main() {
  console.log(`Seeding Supabase${replace ? " (replacing the catalogue)" : ""}…`);

  const colRows = collections.map((c) => ({ id: c.id, handle: c.handle, title: c.title, image: c.image, description: c.description ?? "" }));
  const prodRows = products.map((p) => ({ ...productToRow(p), created_at: p.createdAt }));

  if (replace) {
    // Products first (they reference collection handles), then collections and reviews.
    await prune("products", products.map((p) => p.id));
    await prune("collections", colRows.map((c) => c.id));
    await prune("testimonials", testimonials.map((t) => t.id));
  }

  await check(db.from("collections").upsert(colRows));
  console.log(`✓ collections: ${colRows.length}`);

  await check(db.from("products").upsert(prodRows as never));
  console.log(`✓ products: ${prodRows.length}`);

  if (testimonials.length) {
    await check(db.from("testimonials").upsert(testimonials));
    console.log(`✓ testimonials: ${testimonials.length}`);
  }

  const existing = await check(db.from("settings").select("id").eq("id", 1).maybeSingle());
  if (!existing.data) {
    await check(db.from("settings").insert({ id: 1, data: seedData.settings }));
    console.log("✓ settings (first time)");
  } else {
    console.log("• settings already exist — left unchanged");
  }

  console.log("Done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
