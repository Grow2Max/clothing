import Link from "next/link";
import Image from "next/image";
import { ScrollStory } from "@/components/ScrollStory";
import { SectionHeading } from "@/components/SectionHeading";
import { ProductCarousel } from "@/components/ProductCarousel";
import { CollectionGrid } from "@/components/CollectionGrid";
import { Testimonials } from "@/components/Testimonials";
import { Reveal } from "@/components/Reveal";
import { getAllProducts, getTestimonials, getSettings, getCollections, filterProducts } from "@/lib/data";
import { Instagram, MapPin, Phone, Navigation, MessageCircle } from "lucide-react";
import { brand, telHref } from "@/lib/brand";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, testimonials, settings, collections] = await Promise.all([
    getAllProducts(),
    getTestimonials(),
    getSettings(),
    getCollections(),
  ]);
  const { newLaunches, bestDeals, restocked } = filterProducts(products);

  return (
    <>
      <ScrollStory
        products={newLaunches.length ? newLaunches : products}
        collections={collections}
        whatsapp={settings.whatsapp || brand.socials.whatsapp}
        whatsappGroup={settings.whatsappGroup || brand.socials.whatsappGroup}
        instagram={settings.instagram || brand.socials.instagram}
      />

      {/* tagline band */}
      <section className="bg-petal py-10">
        <div className="container-x text-center">
          <Reveal>
            <h2 className="mt-1 font-serif text-2xl md:text-3xl text-ink">{settings.tagline}</h2>
            <p className="mt-2 text-sm text-ink-soft">{brand.slogan}</p>
          </Reveal>
        </div>
      </section>

      <section className="container-x py-12 md:py-20">
        <SectionHeading title="New Arrivals" subtitle="Our newest sarees, picked by hand." viewAllHref="/collections/all" />
        <ProductCarousel products={newLaunches.length ? newLaunches : products.slice(0, 10)} autoplay />
      </section>

      <section className="bg-goldwash py-12 md:py-20">
        <div className="container-x">
          <SectionHeading title="Shop by Category" subtitle="Silk for big days, cotton for every day." viewAllHref="/collections/all" />
          <CollectionGrid items={collections} />
        </div>
      </section>

      {bestDeals.length > 0 && (
        <section className="container-x py-12 md:py-20">
          <SectionHeading title="Special Prices" subtitle="Lovely sarees at a lower price, while stock lasts." viewAllHref="/collections/all" />
          <ProductCarousel products={bestDeals} />
        </section>
      )}

      {/* help band */}
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#5e0f37_0%,#8e1b55_55%,#a8345f_100%)] py-16 md:py-20">
        {/* soft zari-like dot texture and glow — no photo */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(#f6d884_1px,transparent_1.5px)] [background-size:22px_22px]" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-[#f6d884]/10 blur-3xl" />
        <div className="container-x relative flex h-full flex-col items-center justify-center text-center text-white">
          <Reveal>
            <h2 className="font-serif text-3xl text-white md:text-5xl">Not sure which saree to pick?</h2>
            <p className="mx-auto mt-3 max-w-lg text-white/90">
              Send us a message. Tell us the occasion and your budget, and we&apos;ll help you choose.
            </p>
            <a href={settings.whatsapp || brand.socials.whatsapp} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-silk shadow-card transition hover:-translate-y-0.5 hover:bg-cream">
              <MessageCircle size={16} /> Ask us on WhatsApp
            </a>
          </Reveal>
        </div>
      </section>

      {restocked.length > 0 && (
        <section className="container-x py-12 md:py-20">
          <SectionHeading title="Back in Stock" subtitle="Favourites that are available again." viewAllHref="/collections/all" />
          <ProductCarousel products={restocked} />
        </section>
      )}

      {/* real customer reviews only — the section stays hidden until some are added */}
      {testimonials.length > 0 && (
        <section className="bg-goldwash py-12 md:py-20">
          <div className="container-x">
            <SectionHeading title="What Our Customers Say" />
            <Testimonials items={testimonials} />
          </div>
        </section>
      )}

      {/* instagram */}
      <section className="container-x py-12 md:py-20">
        <SectionHeading title="Follow us on Instagram" subtitle={`@${brand.instagramHandle} · New sarees and updates`} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
          {products.slice(0, 6).map((p) => (
            <a key={p.id} href={settings.instagram} target="_blank" rel="noopener noreferrer" className="group relative aspect-square overflow-hidden rounded bg-cream" aria-label={`Follow @${brand.instagramHandle} on Instagram`}>
              <Image src={p.images[0]} alt={p.title} fill sizes="200px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                <Instagram className="text-white opacity-0 transition-opacity group-hover:opacity-100" size={26} />
              </div>
            </a>
          ))}
        </div>
        <div className="mt-8 text-center">
          <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="btn-outline">
            <Instagram size={16} /> Follow @{brand.instagramHandle}
          </a>
        </div>
      </section>

      {/* visit our store */}
      <section className="bg-blush py-12 md:py-20">
        <div className="container-x grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          <Reveal>
            <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-[10px] border-4 border-gold/50 shadow-card">
              <Image src={brand.logo.full} alt={`${brand.name} logo`} fill sizes="(min-width: 768px) 448px, 100vw" className="object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-serif text-3xl text-ink">Visit Our Warehouse</h2>
            <p className="mt-4 text-ink-soft">
              Come see and feel our sarees in person, or message us on WhatsApp. We&apos;re happy to help you pick
              the right one.
            </p>
            <a href={settings.mapsUrl || brand.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-5 flex items-start gap-2 font-medium text-ink hover:text-mint-deep">
              <MapPin size={18} className="mt-0.5 shrink-0 text-mint-deep" />
              <span>{settings.storeName || brand.name}, {settings.address}</span>
            </a>
            <a href={telHref(settings.supportPhone || brand.phone)} className="mt-3 flex items-center gap-2 font-medium text-ink hover:text-mint-deep">
              <Phone size={18} className="shrink-0 text-mint-deep" /> {settings.supportPhone || brand.phone}
            </a>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={settings.mapsUrl || brand.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                <Navigation size={16} /> Get Directions
              </a>
              <a href={settings.whatsapp || brand.socials.whatsapp} target="_blank" rel="noopener noreferrer" className="btn-outline">
                <MessageCircle size={16} /> Chat on WhatsApp
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
