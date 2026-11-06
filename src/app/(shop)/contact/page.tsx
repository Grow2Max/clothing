import Link from "next/link";
import type { Metadata } from "next";
import { MessageCircle, Phone, MapPin, Users, Instagram, Youtube, Facebook, Navigation, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { TitleOrnament } from "@/components/tamil/Ornaments";
import { Faq, MessageBuilder } from "@/components/info/Interactive";
import { getSettings } from "@/lib/data";
import { brand, telHref } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Contact Us | ${brand.name}`,
  description: `Talk to ${brand.name} on WhatsApp, call us, or visit our store.`,
};

export const dynamic = "force-dynamic";

const faqs = [
  { q: "How do I place an order?", a: "Add the sarees you like to your cart and tap Place Order. We only need your name and mobile number. We will then call or WhatsApp you to confirm everything." },
  { q: "How do I pay?", a: "There is no online payment on the website. When we confirm your order on the call or on WhatsApp, we will tell you how to pay." },
  { q: "Can I see more photos before I buy?", a: "Yes. Message us on WhatsApp with the saree name and we will send you more photos." },
  { q: "Can I visit and see the sarees in person?", a: "Yes, you are welcome at our warehouse. Please message us on WhatsApp before you come, so we can be ready for you." },
  { q: "How do I know about new sarees and offers?", a: "Join our WhatsApp group or follow us on Instagram. We share new arrivals and offers there first." },
];

export default async function ContactPage() {
  const s = await getSettings();
  const phone = s.supportPhone || brand.phone;
  const address = s.address || brand.storeAddress;
  const whatsapp = s.whatsapp || brand.socials.whatsapp;

  const cards = [
    { icon: MessageCircle, title: "Chat on WhatsApp", text: "The quickest way to reach us. Ask about any saree, price or delivery.", href: whatsapp, cta: "Start a chat" },
    { icon: Phone, title: "Call us", text: phone, href: telHref(phone), cta: "Call now" },
    { icon: Users, title: "Join our WhatsApp group", text: "Be the first to see new sarees and offers.", href: s.whatsappGroup || brand.socials.whatsappGroup, cta: "Join the group" },
  ];
  const socials = [
    { href: s.instagram || brand.socials.instagram, label: "Instagram", icon: Instagram },
    { href: s.facebook || brand.socials.facebook, label: "Facebook", icon: Facebook },
    { href: s.youtube || brand.socials.youtube, label: "YouTube", icon: Youtube },
  ];

  return (
    <div className="overflow-hidden bg-ivory">
      {/* ── intro ── */}
      <section className="relative">
        <div className="container-x relative py-14 text-center md:py-20">
          <Reveal>
            <p className="eyebrow">Contact us</p>
            <h1 className="mt-3 font-serif text-4xl text-ink md:text-6xl">We&apos;re happy to <span className="italic text-silk">help</span></h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-ink-soft">
              Questions about a saree, the price or your order? Talk to us. A real person will reply.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── ways to reach us ── */}
      <section className="container-x">
        <div className="grid gap-5 md:grid-cols-3">
          {cards.map(({ icon: Icon, title, text, href, cta }, i) => (
            <Reveal key={title} delay={i * 0.08} className="h-full">
              <a
                href={href}
                target={href.startsWith("tel:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="group flex h-full flex-col rounded-2xl border border-silk/10 bg-white p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-card"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-silk/10 text-silk transition-colors duration-300 group-hover:bg-silk group-hover:text-white"><Icon size={22} /></span>
                <h2 className="mt-5 font-serif text-xl text-ink">{title}</h2>
                <p className="mt-2 flex-1 text-ink-soft">{text}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-silk">
                  {cta} <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── message builder ── */}
      <section className="container-x py-16 md:py-24">
        <Reveal>
          <div className="text-center">
            <h2 className="section-title">Send us a quick message</h2>
            <TitleOrnament className="mx-auto mt-3 h-4 w-32" />
            <p className="mx-auto mt-4 max-w-xl text-ink-soft">Tap a few options and we&apos;ll write the message for you. It opens in WhatsApp, ready to send.</p>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="mt-10">
            <MessageBuilder whatsapp={whatsapp} />
          </div>
        </Reveal>
      </section>

      {/* ── visit ── */}
      <section className="bg-petal/60 py-16 md:py-24">
        <div className="container-x grid items-center gap-10 md:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <p className="eyebrow">Visit us</p>
            <h2 className="mt-3 font-serif text-3xl text-ink md:text-4xl">Come and see our sarees</h2>
            <p className="mt-4 text-lg text-ink-soft">
              Come and see the sarees in person. Please message us on WhatsApp before you come, so we can be ready for you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={s.mapsUrl || brand.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-silk"><Navigation size={16} /> Get directions</a>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn-outline"><MessageCircle size={16} /> Tell us you&apos;re coming</a>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative rounded-3xl bg-white p-7 shadow-card md:p-9">
              <span className="absolute -top-5 left-7 flex h-10 w-10 items-center justify-center rounded-full bg-silk text-white shadow-card"><MapPin size={18} /></span>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark">Address</p>
              <p className="mt-2 font-serif text-xl leading-relaxed text-ink">{s.storeName || brand.name}</p>
              <p className="mt-1 leading-relaxed text-ink-soft">{address}</p>
              <div className="my-6 h-px bg-silk/10" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark">Phone &amp; WhatsApp</p>
              <a href={telHref(phone)} className="mt-2 inline-block font-serif text-xl text-ink hover:text-silk">{phone}</a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── questions ── */}
      <section className="container-x py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="text-center">
              <h2 className="section-title">Common questions</h2>
              <TitleOrnament className="mx-auto mt-3 h-4 w-32" />
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="mt-10"><Faq items={faqs} /></div>
          </Reveal>
        </div>
      </section>

      {/* ── follow ── */}
      <section className="pb-20">
        <div className="container-x text-center">
          <Reveal>
            <p className="font-serif text-2xl text-ink">Follow {brand.name}</p>
            <p className="mt-2 text-ink-soft">See our new sarees and updates.</p>
            <div className="mt-6 flex justify-center gap-3">
              {socials.map(({ href, label, icon: Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-silk/20 bg-white text-silk shadow-soft transition hover:-translate-y-1 hover:bg-silk hover:text-white">
                  <Icon size={20} />
                </a>
              ))}
            </div>
            <Link href="/collections/all" className="mt-10 inline-flex items-center gap-1 text-sm font-semibold text-silk hover:underline">
              Or start browsing our sarees <ArrowRight size={15} />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
