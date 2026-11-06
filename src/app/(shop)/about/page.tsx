import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, MapPin, MessageCircle, Instagram, Hand, HeartHandshake, Package, Store, ShoppingBag, PhoneCall, Truck } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { TitleOrnament } from "@/components/tamil/Ornaments";
import { getCollections, getSettings } from "@/lib/data";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `About Us | ${brand.name}`,
  description: `${brand.name} is a family-run saree shop. We pick every saree by hand and help you choose on WhatsApp.`,
};

export const dynamic = "force-dynamic";

const promises = [
  { icon: Hand, title: "Picked by hand", text: "We check the colour, the weave and the finish of every saree ourselves before it goes on our shop." },
  { icon: HeartHandshake, title: "Help before you buy", text: "Not sure about a colour or which saree suits the occasion? Ask us on WhatsApp. We'll help you choose." },
  { icon: Package, title: "Packed with care", text: "Each saree is folded neatly and packed carefully at our warehouse, so it reaches you looking its best." },
  { icon: Store, title: "A real place to visit", text: "We have a warehouse where you can come and see the sarees in person." },
];

const steps = [
  { icon: ShoppingBag, title: "Pick a saree", text: "Browse our collections and add the sarees you like to your cart." },
  { icon: PhoneCall, title: "Place your order", text: "Just share your name and mobile number. No account or long forms." },
  { icon: MessageCircle, title: "We confirm with you", text: "We call or WhatsApp you to confirm the saree, the price and the delivery details." },
  { icon: Truck, title: "We pack and send it", text: "Your saree is packed with care at our warehouse and sent to you." },
];

export default async function AboutPage() {
  const [settings, collections] = await Promise.all([getSettings(), getCollections()]);
  const whatsapp = settings.whatsapp || brand.socials.whatsapp;

  return (
    <div className="overflow-hidden bg-ivory">
      {/* ── intro ── */}
      <section className="relative">
        <div className="container-x relative grid items-center gap-12 py-14 md:grid-cols-2 md:py-20">
          <Reveal>
            <p className="eyebrow">About us</p>
            <h1 className="mt-3 font-serif text-4xl leading-tight text-ink md:text-6xl">
              A saree shop with <span className="italic text-silk">a love for silk</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-soft">
              {brand.name} is a saree shop founded by{" "}
              <a href={brand.founder.instagram} target="_blank" rel="noopener noreferrer" className="font-medium text-silk hover:underline">
                {brand.founder.name}
              </a>
              . We bring you silk, soft silk, Banarasi and cotton sarees for weddings, festivals and every day.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/collections/all" className="btn-silk">See our sarees <ArrowRight size={16} /></Link>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn-outline"><MessageCircle size={16} /> Talk to us</a>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative mx-auto w-full max-w-md">
              <div className="relative aspect-square overflow-hidden rounded-[28px] border-4 border-white shadow-card">
                <Image src={brand.logo.full} alt={`${brand.name} logo`} fill sizes="(min-width: 768px) 448px, 100vw" className="object-cover" priority />
              </div>
              <div className="absolute -bottom-5 -left-4 flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-ink shadow-card md:-left-8">
                Wrapped with love
              </div>
              <div className="absolute -right-3 -top-4 rounded-full bg-silk px-4 py-2.5 text-sm font-medium text-white shadow-card md:-right-6">
                Handpicked sarees
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── promise ── */}
      <section className="container-x py-16 md:py-24">
        <Reveal>
          <div className="mx-auto max-w-3xl rounded-[28px] bg-gradient-to-br from-petal to-goldwash p-8 text-center shadow-soft md:p-14">
            <p className="eyebrow">Our promise</p>
            <p className="mt-4 font-serif text-4xl text-silk md:text-6xl">{brand.name}</p>
            <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft">
              Pure joy. That is how we want you to feel when you open your parcel, and every time you wear your saree.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── our promise ── */}
      <section className="bg-petal/60 py-16 md:py-24">
        <div className="container-x">
          <Reveal>
            <div className="text-center">
              <h2 className="section-title">Our promise to you</h2>
              <TitleOrnament className="mx-auto mt-3 h-4 w-32" />
            </div>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {promises.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 0.08}>
                <div className="group h-full rounded-2xl bg-white p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-card">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-silk/10 text-silk transition-colors duration-300 group-hover:bg-silk group-hover:text-white">
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-5 font-serif text-xl text-ink">{title}</h3>
                  <p className="mt-2 text-ink-soft">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── how ordering works ── */}
      <section className="container-x py-16 md:py-24">
        <Reveal>
          <div className="text-center">
            <h2 className="section-title">How ordering works</h2>
            <TitleOrnament className="mx-auto mt-3 h-4 w-32" />
            <p className="mx-auto mt-4 max-w-xl text-ink-soft">Simple and personal. You always talk to a real person.</p>
          </div>
        </Reveal>
        <ol className="relative mx-auto mt-12 max-w-3xl">
          <span className="absolute bottom-6 left-6 top-6 w-px bg-gradient-to-b from-silk/40 via-gold/40 to-silk/10 md:left-1/2" aria-hidden="true" />
          {steps.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.06}>
              <li className={`relative mb-8 flex gap-5 md:w-1/2 ${i % 2 ? "md:ml-auto md:pl-10" : "md:pr-10 md:text-right md:flex-row-reverse"}`}>
                <span className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-silk text-white shadow-card ${i % 2 ? "md:-ml-16" : "md:-mr-16"}`}>
                  <Icon size={20} />
                </span>
                <div className="rounded-2xl bg-white p-5 shadow-soft">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark">Step {i + 1}</p>
                  <h3 className="mt-1 font-serif text-xl text-ink">{title}</h3>
                  <p className="mt-1 text-ink-soft">{text}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ── what we offer ── */}
      {collections.length > 0 && (
        <section className="bg-goldwash/60 py-16 md:py-24">
          <div className="container-x">
            <Reveal>
              <div className="text-center">
                <h2 className="section-title">Sarees for every moment</h2>
                <TitleOrnament className="mx-auto mt-3 h-4 w-32" />
              </div>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {collections.map((c, i) => (
                <Reveal key={c.id} delay={(i % 6) * 0.05}>
                  <Link href={`/collections/${c.handle}`} className="group block">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-cream shadow-soft">
                      <Image src={c.image} alt={c.title} fill sizes="(max-width:768px) 50vw, 16vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent" />
                      <p className="absolute inset-x-0 bottom-0 p-3 text-center font-serif text-lg text-white">{c.title}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── come and say hello ── */}
      <section className="container-x py-16 md:py-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#5e0f37_0%,#8e1b55_60%,#a8345f_100%)] px-6 py-14 text-center text-white md:px-16">
            <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(#f6d884_1px,transparent_1.5px)] [background-size:22px_22px]" />
            <h2 className="relative font-serif text-3xl text-white md:text-5xl">Come and say hello</h2>
            <p className="relative mx-auto mt-4 max-w-xl text-white/85">
              Visit our warehouse, or talk to us on WhatsApp. We&apos;re always happy to help you find the right saree.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-silk shadow-card transition hover:-translate-y-0.5"><MessageCircle size={16} /> Chat on WhatsApp</a>
              <a href={settings.mapsUrl || brand.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"><MapPin size={16} /> Get directions</a>
              <a href={settings.instagram || brand.socials.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"><Instagram size={16} /> Follow on Instagram</a>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
