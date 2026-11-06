import { revalidateTag } from "next/cache";
import { CATALOG_TAG } from "./data";

/** Call after any admin change to products, collections, settings or reviews. */
export function revalidateCatalog() {
  revalidateTag(CATALOG_TAG);
}
