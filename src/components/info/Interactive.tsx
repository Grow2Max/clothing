"use client";
// Small interactive pieces for the About and Contact pages.
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import Image from "next/image";
import { CheckCheck, ChevronDown, MessageCircle } from "lucide-react";
import { brand } from "@/lib/brand";

/** Number that counts up when it scrolls into view. */
export function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(to); return; }
    const start = performance.now();
    const dur = 1100;
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / dur);
      setN(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return <span ref={ref}>{n}{suffix}</span>;
}

/** Simple question-and-answer list; one open at a time. */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-silk/10 rounded-2xl border border-silk/10 bg-white shadow-soft">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left md:px-6"
            >
              <span className="font-serif text-lg text-ink">{it.q}</span>
              <ChevronDown size={18} className={`shrink-0 text-silk transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-ink-soft md:px-6">{it.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/** Builds a WhatsApp message from a few taps, then opens WhatsApp with it. */
export function MessageBuilder({ whatsapp }: { whatsapp: string }) {
  const topics = ["Help me choose a saree", "Ask about my order", "I want to visit the warehouse", "Something else"];
  const occasions = ["Wedding", "Festival", "Function", "Office / daily wear", "A gift"];
  const [topic, setTopic] = useState(topics[0]);
  const [occasion, setOccasion] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  const message = [
    `Hi ${brand.name}${name.trim() ? `, this is ${name.trim()}` : ""}.`,
    `${topic}.`,
    topic === topics[0] && occasion ? `It's for: ${occasion}.` : "",
    note.trim(),
  ].filter(Boolean).join(" ");
  const href = `${whatsapp}${whatsapp.includes("?") ? "&" : "?"}text=${encodeURIComponent(message)}`;

  const chip = (on: boolean) =>
    `rounded-full border px-4 py-2 text-sm transition ${on ? "border-silk bg-silk text-white" : "border-ink/15 bg-white text-ink hover:border-silk/50"}`;

  return (
    <div className="grid gap-8 rounded-3xl border border-silk/10 bg-white p-6 shadow-card md:grid-cols-[1.2fr_1fr] md:p-10">
      <div className="space-y-6">
        <div>
          <p className="mb-3 text-sm font-medium text-ink">What do you need?</p>
          <div className="flex flex-wrap gap-2">
            {topics.map((t) => (
              <button key={t} type="button" aria-pressed={topic === t} onClick={() => setTopic(t)} className={chip(topic === t)}>{t}</button>
            ))}
          </div>
        </div>
        <AnimatePresence initial={false}>
          {topic === topics[0] && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <p className="mb-3 text-sm font-medium text-ink">What is the occasion? <span className="font-normal text-ink-soft">(optional)</span></p>
              <div className="flex flex-wrap gap-2">
                {occasions.map((o) => (
                  <button key={o} type="button" aria-pressed={occasion === o} onClick={() => setOccasion(occasion === o ? null : o)} className={chip(occasion === o)}>{o}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">Your name <span className="font-normal text-ink-soft">(optional)</span></span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none focus:border-silk" />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm font-medium text-ink">Anything else? <span className="font-normal text-ink-soft">(optional)</span></span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={400} placeholder="Colour, budget, saree name…" className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none focus:border-silk" />
          </label>
        </div>
      </div>

      {/* live preview */}
      <div className="flex flex-col">
        <p className="mb-3 text-sm font-medium text-ink">Your message</p>
        {/* WhatsApp-style chat preview */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl shadow-soft">
          <div className="flex items-center gap-3 bg-[#008069] px-4 py-3 text-white">
            <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white">
              <Image src="/icon.png" alt="" fill sizes="36px" className="object-cover" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold">{brand.name}</span>
              <span className="block text-xs text-white/75">WhatsApp</span>
            </span>
          </div>
          <div className="flex-1 bg-[#efeae2] p-4 [background-image:radial-gradient(rgba(0,0,0,0.035)_1px,transparent_1.5px)] [background-size:14px_14px]">
            <motion.div layout className="relative ml-auto w-fit max-w-[88%] rounded-lg rounded-tr-none bg-[#d9fdd3] px-3 pb-1.5 pt-2 text-sm text-[#111b21] shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]">
              <svg viewBox="0 0 8 13" className="absolute -right-2 top-0 h-[13px] w-2" aria-hidden="true"><path d="M0 0h8L0 13z" fill="#d9fdd3" /></svg>
              {message}
              <span className="ml-3 inline-flex translate-y-1 items-center gap-1 text-[11px] text-[#667781]">
                now <CheckCheck size={14} className="text-[#53bdeb]" />
              </span>
            </motion.div>
          </div>
        </div>
        <a href={href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-[#1ebe5a]">
          <MessageCircle size={18} /> Send on WhatsApp
        </a>
        <p className="mt-2 text-center text-xs text-ink-soft">Opens WhatsApp with this message. You can edit it before sending.</p>
      </div>
    </div>
  );
}
