"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, ShoppingBag, Menu, X, ChevronDown, ArrowRight, Instagram, Youtube, Facebook, MessageCircle } from "lucide-react";
import { brand } from "@/lib/brand";
import { useCart } from "@/lib/cart-store";
import { smoothScroll } from "@/lib/smooth-scroll";
import type { Collection, StoreSettings } from "@/lib/types";

const pages = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

export function Header({ settings, collections = [] }: { settings?: StoreSettings; collections?: Collection[] }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const count = useCart((s) => s.count());
  const openCart = useCart((s) => s.open);
  const storeName = settings?.storeName || brand.name;
  const instagram = settings?.instagram || brand.socials.instagram;
  const youtube = settings?.youtube || brand.socials.youtube;
  const facebook = settings?.facebook || brand.socials.facebook;
  const whatsapp = settings?.whatsapp || brand.socials.whatsapp;

  // Close menus whenever the page changes; Escape closes the collections panel.
  useEffect(() => {
    setMenuOpen(false);
    setMobileOpen(false);
  }, [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // While the phone menu is open, freeze the page behind it so only the menu scrolls.
  useEffect(() => {
    if (!mobileOpen) return;
    const root = document.documentElement;
    const prev = { overflow: root.style.overflow, overscroll: root.style.overscrollBehavior };
    root.style.overflow = "hidden";
    root.style.overscrollBehavior = "none";
    smoothScroll.get()?.stop();
    return () => {
      root.style.overflow = prev.overflow;
      root.style.overscrollBehavior = prev.overscroll;
      smoothScroll.get()?.start();
    };
  }, [mobileOpen]);

  // Small delay before closing so moving the mouse from the button to the panel is easy.
  const openMenu = () => { clearTimeout(closeTimer.current); setMenuOpen(true); };
  const closeMenuSoon = () => { clearTimeout(closeTimer.current); closeTimer.current = setTimeout(() => setMenuOpen(false), 140); };

  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const navLink = (href: string) =>
    `relative py-2 transition-colors hover:text-silk after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-silk after:transition-transform ${
      active(href) ? "text-silk after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"
    }`;

  return (
    <header className="sticky top-0 z-40" onMouseLeave={closeMenuSoon}>
      <div className="bg-[color:var(--story-bg,#f3e6da)] transition-colors duration-200">
        <div
          className="container-x flex h-[var(--header-h)] items-center justify-between gap-4"
          onMouseOver={(e) => {
            // Hovering Home, About, Contact, the logo or the icons closes the panel.
            if (menuOpen && !(e.target as HTMLElement).closest("[data-collections-trigger]")) closeMenuSoon();
          }}
        >
          {/* mobile menu */}
          <button className="-ml-2 flex h-10 w-10 items-center justify-center lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={24} />
          </button>

          {/* logo */}
          <Link href="/" className="flex items-center gap-2" aria-label={`${storeName} home`}>
            <Image src={brand.logo.wordmark} alt={storeName} width={brand.logo.width} height={brand.logo.height} priority className="h-11 w-auto sm:h-14" />
          </Link>

          {/* desktop nav */}
          <nav className="hidden items-center gap-8 text-sm font-medium uppercase tracking-wide text-ink lg:flex" aria-label="Main">
            <Link href="/" className={navLink("/")}>Home</Link>
            <button
              type="button"
              className={`${navLink("/collections")} flex items-center gap-1 uppercase`}
              aria-expanded={menuOpen}
              aria-controls="collections-menu"
              data-collections-trigger
              onMouseEnter={openMenu}
              onClick={() => setMenuOpen((o) => !o)}
            >
              Collections <ChevronDown size={14} className={`transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} />
            </button>
            {pages.map((p) => (
              <Link key={p.href} href={p.href} className={navLink(p.href)}>{p.label}</Link>
            ))}
          </nav>

          {/* actions */}
          <div className="-mr-2 flex items-center gap-1 text-ink">
            {/* 40px tap areas around 20px icons */}
            <Link href="/search" aria-label="Search" className="flex h-10 w-10 items-center justify-center hover:text-silk"><Search size={20} /></Link>
            <button onClick={openCart} aria-label="Cart" className="relative flex h-10 w-10 items-center justify-center hover:text-silk">
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-wine px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* desktop collections panel */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="collections-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-x-0 top-full hidden border-t border-silk/10 bg-white shadow-card lg:block"
            onMouseEnter={openMenu}
          >
            <div className="container-x grid grid-cols-7 gap-4 py-6">
              {collections.map((c) => (
                <Link key={c.id} href={`/collections/${c.handle}`} className="group block" onClick={() => setMenuOpen(false)}>
                  <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-cream">
                    <Image src={c.image} alt="" fill sizes="180px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <p className="mt-2 font-serif text-[15px] text-ink transition-colors group-hover:text-silk">{c.title}</p>
                  {c.description && <p className="mt-0.5 line-clamp-2 text-xs text-ink-soft">{c.description}</p>}
                </Link>
              ))}
              <Link
                href="/collections/all"
                onClick={() => setMenuOpen(false)}
                className="group flex aspect-[4/5] flex-col items-center justify-center rounded-lg border border-dashed border-silk/30 bg-petal/50 text-center transition-colors hover:border-silk hover:bg-petal"
              >
                <span className="font-serif text-lg text-ink">All sarees</span>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-silk">
                  Browse <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div className="absolute inset-0 touch-none bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
              className="absolute left-0 top-0 flex h-[100dvh] w-80 max-w-[85vw] flex-col overflow-y-auto overscroll-contain bg-white p-6 pb-10 shadow-xl"
              data-lenis-prevent
            >
              <div className="mb-6 flex items-center justify-between">
                <Image src={brand.logo.wordmark} alt={storeName} width={brand.logo.width} height={brand.logo.height} className="h-10 w-auto" />
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={22} /></button>
              </div>
              <nav className="flex flex-col text-sm uppercase tracking-wide text-ink" aria-label="Main">
                <Link href="/" className="border-b border-ink/5 py-3">Home</Link>
                <p className="pb-2 pt-4 text-xs font-semibold text-gold-dark">Collections</p>
                <div className="flex flex-col gap-1 normal-case tracking-normal">
                  {collections.map((c) => (
                    <Link key={c.id} href={`/collections/${c.handle}`} className="flex items-center gap-3 rounded-lg py-1.5 active:bg-petal">
                      <span className="relative h-12 w-10 shrink-0 overflow-hidden rounded-md bg-cream">
                        <Image src={c.image} alt="" fill sizes="40px" className="object-cover" />
                      </span>
                      <span className="font-serif text-base">{c.title}</span>
                    </Link>
                  ))}
                  <Link href="/collections/all" className="mt-1 inline-flex items-center gap-1 py-2 text-sm font-semibold text-silk">
                    All sarees <ArrowRight size={14} />
                  </Link>
                </div>
                {pages.map((p) => (
                  <Link key={p.href} href={p.href} className="border-t border-ink/5 py-3">{p.label}</Link>
                ))}
              </nav>
              <div className="mt-6 flex gap-3">
                <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-silk/20 text-silk transition hover:bg-silk hover:text-white">
                  <Instagram size={20} />
                </a>
                <a href={youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-silk/20 text-silk transition hover:bg-silk hover:text-white">
                  <Youtube size={20} />
                </a>
                <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-silk/20 text-silk transition hover:bg-silk hover:text-white">
                  <Facebook size={20} />
                </a>
              </div>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer"
                className="mt-5 flex items-center justify-center gap-2 rounded-full bg-silk px-5 py-3 text-sm font-semibold text-white shadow-soft">
                <MessageCircle size={18} /> WhatsApp {settings?.supportPhone || brand.phone}
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
