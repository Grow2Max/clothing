"use client";
import { useEffect, useState } from "react";
import { Save, Check } from "lucide-react";
import type { StoreSettings } from "@/lib/types";

const FIELDS: { key: keyof StoreSettings; label: string; type?: string; full?: boolean }[] = [
  { key: "storeName", label: "Store name" },
  { key: "tagline", label: "Tagline" },
  { key: "supportEmail", label: "Support email", type: "email" },
  { key: "supportPhone", label: "Support phone" },
  { key: "address", label: "Store / warehouse address", full: true },
  { key: "mapsUrl", label: "Google Maps link", full: true },
  { key: "instagram", label: "Instagram URL" },
  { key: "youtube", label: "YouTube URL" },
  { key: "facebook", label: "Facebook URL" },
  { key: "whatsapp", label: "WhatsApp chat URL (wa.me/…)" },
  { key: "whatsappGroup", label: "WhatsApp group invite URL", full: true },
  { key: "freeShippingThreshold", label: "Free shipping over (₹)", type: "number" },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then(setSettings);
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!settings) return <p className="text-ink-soft">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl text-ink">Settings</h1>
      <p className="mt-1 text-sm text-ink-soft">Manage your store details, contact info and storefront messaging.</p>

      <form onSubmit={save} className="mt-8 rounded-[12px] border bg-white p-6 shadow-soft">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {FIELDS.map((f) => (
            <label key={f.key} className={f.full ? "md:col-span-2" : ""}>
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-soft">{f.label}</span>
              <input
                type={f.type ?? "text"}
                value={(settings[f.key] ?? "") as string | number}
                onChange={(e) =>
                  setSettings({ ...settings, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value })
                }
                className="w-full rounded-lg border border-ink/20 px-3 py-2.5 text-sm outline-none focus:border-mint-deep"
              />
            </label>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-4">
          <button disabled={saving} className="btn-primary">
            {saved ? <><Check size={16} /> Saved</> : <><Save size={16} /> {saving ? "Saving…" : "Save changes"}</>}
          </button>
          <p className="text-xs text-ink-soft">Changes are saved to the database and show on the store immediately.</p>
        </div>
      </form>
    </div>
  );
}
