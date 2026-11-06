import { notFound } from "next/navigation";
import { getProductByHandle, getRelatedProducts } from "@/lib/data";
import { ProductDetail } from "@/components/ProductDetail";
import { ProductCarousel } from "@/components/ProductCarousel";
import { SectionHeading } from "@/components/SectionHeading";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { handle: string } }) {
  const product = await getProductByHandle(params.handle);
  if (!product) notFound();

  // Similar sarees: same category first, then same fabric, then a similar price.
  const related = await getRelatedProducts(product);

  return (
    <div className="pb-16">
      <ProductDetail product={product} />
      {related.length > 0 && (
        <section className="container-x mt-20">
          <SectionHeading title="You May Also Like" />
          <ProductCarousel products={related} />
        </section>
      )}
    </div>
  );
}
