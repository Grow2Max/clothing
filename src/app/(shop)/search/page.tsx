import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllProducts, getCollections, getSettings } from "@/lib/data";
import { SearchClient } from "@/components/SearchClient";
import { brand } from "@/lib/brand";

export const metadata: Metadata = { title: `Search sarees | ${brand.name}` };
export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const [products, collections, settings] = await Promise.all([getAllProducts(), getCollections(), getSettings()]);
  return (
    <Suspense>
      <SearchClient
        products={products.filter((p) => p.inStock)}
        collections={collections}
        whatsapp={settings.whatsapp || brand.socials.whatsapp}
      />
    </Suspense>
  );
}
