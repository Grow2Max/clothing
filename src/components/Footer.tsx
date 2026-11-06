import Link from "next/link";
import Image from "next/image";
import { Instagram, Youtube, Facebook, MessageCircle, MapPin, Phone, Users, Navigation } from "lucide-react";
import { brand, telHref } from "@/lib/brand";
import type { Collection, StoreSettings } from "@/lib/types";

const quickLinks = [
  { label: "All Sarees", href: "/collections/all" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Search", href: "/search" },
];

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

export function Footer({ settings, collections = [] }: { settings?: StoreSettings; collections?: Collection[] }) {
  const storeName = settings?.storeName || brand.name;
  const tagline = settings?.tagline || brand.tagline;
  const address = settings?.address || brand.storeAddress;
  const phone = settings?.supportPhone || brand.phone;
  const email = settings?.supportEmail;
  const mapsUrl = settings?.mapsUrl || brand.mapsUrl;
  const whatsapp = settings?.whatsapp || brand.socials.whatsapp;
  const whatsappGroup = settings?.whatsappGroup || brand.socials.whatsappGroup;
  const socials = [
    { href: settings?.instagram || brand.socials.instagram, label: "Instagram", icon: Instagram },
    { href: settings?.youtube || brand.socials.youtube, label: "YouTube", icon: Youtube },
    { href: settings?.facebook || brand.socials.facebook, label: "Facebook", icon: Facebook },
    { href: whatsapp, label: "WhatsApp", icon: MessageCircle },
  ];

  return (
    <footer className="mt-20 bg-mint-deep text-white/85">
      <div className="container-x grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3>
            <Image src={brand.logo.wordmarkLight} alt={storeName} width={brand.logo.width} height={brand.logo.height} className="h-16 w-auto" />
          </h3>
          <p className="mt-3 font-serif text-sm italic text-white/90">{tagline}.</p>
          <p className="mt-1 text-sm text-white/75">{brand.slogan}</p>
          <div className="mt-5 flex gap-3">
            {socials.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                {...ext}
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/85 transition hover:border-white hover:bg-white hover:text-mint-deep"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
          <p className="mt-5 text-xs text-white/60">
            Founder ·{" "}
            <a href={brand.founder.instagram} {...ext} className="underline hover:text-white">
              {brand.founder.name}
            </a>
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Quick links</h4>
          <ul className="space-y-2 text-sm">
            {quickLinks.map((l) => (
              <li key={l.label}><Link href={l.href} className="hover:text-white">{l.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Shop</h4>
          <ul className="space-y-2 text-sm">
            {collections.map((c) => (
              <li key={c.id}><Link href={`/collections/${c.handle}`} className="hover:text-white">{c.title}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Get in touch</h4>
          <ul className="space-y-3 text-sm text-white/80">
            <li>
              <a href={telHref(phone)} className="flex items-center gap-2 hover:text-white"><Phone size={16} className="shrink-0" />{phone}</a>
            </li>
            <li>
              <a href={whatsapp} {...ext} className="flex items-center gap-2 hover:text-white"><MessageCircle size={16} className="shrink-0" />Chat on WhatsApp</a>
            </li>
            {email && (
              <li><a href={`mailto:${email}`} className="hover:text-white">{email}</a></li>
            )}
            <li>
              <a href={mapsUrl} {...ext} className="flex items-start gap-2 hover:text-white">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span>
                  <span className="block font-medium text-white">Warehouse</span>
                  {address}
                </span>
              </a>
              <a href={mapsUrl} {...ext} className="ml-6 mt-1 inline-flex items-center gap-1 text-xs text-gold-light underline hover:text-white">
                <Navigation size={12} /> Get directions
              </a>
            </li>
          </ul>
          <a
            href={whatsappGroup}
            {...ext}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
          >
            <Users size={16} /> Join our WhatsApp Group
          </a>
          <p className="mt-2 text-xs text-white/60">First look at new arrivals &amp; offers.</p>
        </div>
      </div>

      <div className="border-t border-white/10">
        {/* centred, with room at the bottom on phones so the floating WhatsApp button never covers it */}
        <div className="container-x flex flex-col items-center justify-center gap-3 pb-24 pt-5 text-center text-xs text-white/60 sm:flex-row sm:gap-6 sm:pb-6">
          <span>© {new Date().getFullYear()} {storeName}. All rights reserved.</span>
          {/* site credit */}
          <a
            href="https://www.grow2max.in/"
            target="_blank"
            rel="noopener"
            className="group inline-flex items-center gap-2 rounded-full border border-white/15 py-1 pl-1 pr-3 transition hover:border-white/40 hover:text-white"
          >
            <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-white">
              <Image src="/brand/grow2max-logo.png" alt="" width={24} height={24} loading="eager" className="h-5 w-5 object-contain" />
            </span>
            <span>
              Designed &amp; developed by <strong className="font-semibold text-white/85 group-hover:text-white">Grow 2 Max</strong>
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
