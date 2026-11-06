import { notFound } from "next/navigation";
import { getCollectionByHandle, getProductsInCollection, getAllProducts } from "@/lib/data";
import { InfiniteProducts } from "@/components/InfiniteProducts";
import { PAGE_SIZE } from "@/lib/paging";
import { Reveal } from "@/components/Reveal";

export const dynamic = "force-dynamic";

export default async function CollectionPage({ params }: { params: { handle: string } }) {
  const all = params.handle === "all";
  const col = all ? null : await getCollectionByHandle(params.handle);
  if (!all && !col) notFound();
  const title = all ? "All Sarees" : col!.title;
  const products = all ? await getAllProducts() : await getProductsInCollection(params.handle);

  return (
    <div className="container-x py-12">
      <Reveal>
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Collection</p>
          <h1 className="mt-2 font-serif text-4xl text-ink">{title}</h1>
          {col?.description && <p className="mx-auto mt-3 max-w-xl text-sm text-ink-soft">{col.description}</p>}
          <div className="mx-auto mt-4 h-px w-16 bg-gold" />
          <p className="mt-4 text-sm text-ink-soft">{products.length} {products.length === 1 ? "saree" : "sarees"}</p>
        </div>
      </Reveal>

      {products.length === 0 ? (
        <p className="py-20 text-center text-ink-soft">No sarees in this collection yet. Message us on WhatsApp and we&apos;ll tell you what&apos;s coming.</p>
      ) : (
        // first page from the server; the rest loads as the visitor scrolls
        <InfiniteProducts key={params.handle} initial={products.slice(0, PAGE_SIZE)} total={products.length} collection={params.handle} />
      )}
    </div>
  );
}
