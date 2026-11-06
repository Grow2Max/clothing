import { NextResponse } from "next/server";
import { getAllProducts, getProductsInCollection } from "@/lib/data";
import { PAGE_SIZE } from "@/lib/paging";

// One page of a collection's sarees, for endless scrolling on collection pages.
// GET /api/catalog?collection=<handle|all>&offset=12&limit=12
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const collection = sp.get("collection") ?? "all";
  const offset = Math.max(0, Number(sp.get("offset")) || 0);
  const limit = Math.min(48, Math.max(1, Number(sp.get("limit")) || PAGE_SIZE));
  const list = collection === "all" ? await getAllProducts() : await getProductsInCollection(collection);
  return NextResponse.json({ items: list.slice(offset, offset + limit), total: list.length });
}
