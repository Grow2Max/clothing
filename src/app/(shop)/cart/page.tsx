"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, CheckCircle, MessageCircle } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { money } from "@/lib/format";
import { brand } from "@/lib/brand";
import { smoothScroll } from "@/lib/smooth-scroll";
import { formatIndianMobile, validateCheckout, type CheckoutErrors, type CheckoutFields } from "@/lib/order-validation";

export default function CartPage() {
  const { items, setQty, remove, clear } = useCart();
  const total = useCart((s) => s.total());
  const [placed, setPlaced] = useState<{ id: string; phone: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CheckoutFields>({ customerName: "", phone: "", address: "" });
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof CheckoutFields, boolean>>>({});
  const [serverError, setServerError] = useState("");
  // The saved cart is restored just after the page loads; wait for it before deciding
  // whether the cart is empty (avoids a flash of "Your cart is empty").
  const [cartReady, setCartReady] = useState(false);
  useEffect(() => {
    setCartReady(useCart.persist.hasHydrated());
    return useCart.persist.onFinishHydration(() => setCartReady(true));
  }, []);
  const fieldRefs = useRef<Partial<Record<keyof CheckoutFields, HTMLInputElement | HTMLTextAreaElement | null>>>({});

  const update = (key: keyof CheckoutFields, value: string) => {
    const next = { ...form, [key]: value };
    setForm(next);
    if (touched[key]) setErrors(validateCheckout(next)); // live feedback once a field was visited
  };
  const blur = (key: keyof CheckoutFields) => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validateCheckout(form));
  };

  const scrollToTop = () => {
    const lenis = smoothScroll.get();
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo({ top: 0, behavior: "auto" });
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    const found = validateCheckout(form);
    setErrors(found);
    setTouched({ customerName: true, phone: true, address: true });
    const firstBad = (["customerName", "phone", "address"] as const).find((k) => found[k]);
    if (firstBad) {
      fieldRefs.current[firstBad]?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        setServerError(data.error || "Sorry, something went wrong. Please try again.");
        return;
      }
      setPlaced({ id: data.id, phone: data.phone });
      clear();
      scrollToTop(); // show the thank-you message straight away (the button is far down on phones)
    } catch {
      setServerError("Couldn't reach the shop. Please check your internet and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (placed) {
    const msg = encodeURIComponent(`Hi ${brand.name}, I just placed order ${placed.id}.`);
    return (
      <div className="container-x flex flex-col items-center py-20 text-center">
        <CheckCircle className="text-silk" size={56} />
        <h1 className="mt-4 font-serif text-3xl text-ink">Thank you for your order!</h1>
        <p className="mt-3 max-w-md text-ink-soft">
          Your order number is <strong className="text-ink">{placed.id}</strong>. We will call or WhatsApp you on{" "}
          <strong className="whitespace-nowrap text-ink">{formatIndianMobile(placed.phone)}</strong> to confirm the details.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={`${brand.socials.whatsapp}?text=${msg}`} target="_blank" rel="noopener noreferrer" className="btn-silk">
            <MessageCircle size={16} /> Message us on WhatsApp
          </a>
          <Link href="/" className="btn-outline">Continue shopping</Link>
        </div>
      </div>
    );
  }

  if (!cartReady) {
    return (
      <div className="container-x py-12" aria-busy="true" aria-label="Loading your cart">
        <div className="h-8 w-40 animate-pulse rounded bg-sand/70" />
        <div className="mt-8 h-28 animate-pulse rounded-lg bg-sand/50" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-x flex flex-col items-center py-24 text-center">
        <h1 className="font-serif text-3xl text-ink">Your cart is empty</h1>
        <Link href="/" className="btn-gold mt-8">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-x py-12">
      <h1 className="mb-8 font-serif text-3xl text-ink">Your Cart</h1>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* items */}
        <div className="lg:col-span-2">
          <ul className="divide-y">
            {items.map((it) => (
              <li key={`${it.productId}-${it.size}`} className="flex gap-4 py-5">
                <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded bg-cream">
                  <Image src={it.image} alt={it.title} fill className="object-cover" sizes="96px" />
                </div>
                <div className="flex flex-1 flex-col">
                  <p className="font-medium text-ink">{it.title}</p>
                  <p className="text-sm text-ink-soft">Size: {it.size}</p>
                  <p className="text-sm text-ink">{money(it.price)}</p>
                  <div className="mt-auto flex items-center gap-4">
                    <div className="flex items-center rounded border">
                      <button className="px-2.5 py-1.5" onClick={() => setQty(it.productId, it.size, it.quantity - 1)}><Minus size={14} /></button>
                      <span className="w-8 text-center text-sm">{it.quantity}</span>
                      <button className="px-2.5 py-1.5" onClick={() => setQty(it.productId, it.size, it.quantity + 1)}><Plus size={14} /></button>
                    </div>
                    <button onClick={() => remove(it.productId, it.size)} className="text-ink-soft hover:text-wine"><Trash2 size={17} /></button>
                  </div>
                </div>
                <div className="font-medium text-ink">{money(it.price * it.quantity)}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* checkout form */}
        <div>
          <div className="rounded-[10px] bg-cream p-6 shadow-soft">
            <h2 className="mb-4 font-serif text-xl text-ink">Order Summary</h2>
            <div className="flex justify-between border-b py-2 text-sm"><span>Subtotal</span><span>{money(total)}</span></div>
            <div className="flex justify-between border-b py-2 text-sm"><span>Shipping</span><span className="text-mint-deep">Free</span></div>
            <div className="flex justify-between py-3 text-lg font-serif text-ink"><span>Total</span><span>{money(total)}</span></div>

            <form onSubmit={placeOrder} noValidate className="mt-4 space-y-4">
              <Field label="Your name" required error={touched.customerName ? errors.customerName : undefined} id="customerName">
                <input
                  id="customerName"
                  ref={(el) => { fieldRefs.current.customerName = el; }}
                  autoComplete="name"
                  value={form.customerName}
                  onChange={(e) => update("customerName", e.target.value)}
                  onBlur={() => blur("customerName")}
                  aria-invalid={!!(touched.customerName && errors.customerName)}
                  aria-describedby="customerName-error"
                  className={inputClass(!!(touched.customerName && errors.customerName))}
                />
              </Field>
              <Field label="Mobile number" required hint="We'll call or WhatsApp you to confirm." error={touched.phone ? errors.phone : undefined} id="phone">
                <div className="flex">
                  <span className="flex items-center rounded-l border border-r-0 border-ink/20 bg-white px-3 text-sm text-ink-soft">+91</span>
                  <input
                    id="phone"
                    ref={(el) => { fieldRefs.current.phone = el; }}
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="98765 43210"
                    maxLength={16}
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value.replace(/[^\d\s+-]/g, ""))}
                    onBlur={() => blur("phone")}
                    aria-invalid={!!(touched.phone && errors.phone)}
                    aria-describedby="phone-error phone-hint"
                    className={`${inputClass(!!(touched.phone && errors.phone))} rounded-l-none`}
                  />
                </div>
              </Field>
              <Field label="Delivery address" hint="You can also share it with us on the call." error={touched.address ? errors.address : undefined} id="address">
                <textarea
                  id="address"
                  ref={(el) => { fieldRefs.current.address = el; }}
                  autoComplete="street-address"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  onBlur={() => blur("address")}
                  rows={3}
                  aria-describedby="address-error address-hint"
                  className={inputClass(!!(touched.address && errors.address))}
                />
              </Field>
              {serverError && <p role="alert" className="rounded bg-wine/10 px-3 py-2 text-sm text-wine">{serverError}</p>}
              <button type="submit" disabled={submitting} className="btn-silk w-full justify-center disabled:opacity-60">
                {submitting ? "Placing order…" : "Place Order"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputClass = (bad: boolean) =>
  `w-full rounded border bg-white px-3 py-2.5 text-sm outline-none transition-colors ${
    bad ? "border-wine focus:border-wine" : "border-ink/20 focus:border-ink"
  }`;

function Field({ id, label, required, hint, error, children }: {
  id: string; label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink">
        {label} {required ? <span className="text-wine">*</span> : <span className="font-normal text-ink-soft">(optional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-wine">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-ink-soft">{hint}</p>
      ) : null}
    </div>
  );
}
