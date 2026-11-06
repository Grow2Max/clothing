"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { brand } from "@/lib/brand";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      // Go back to the admin page that was requested (only /admin paths are allowed).
      const next = new URLSearchParams(window.location.search).get("next");
      router.push(next && /^\/admin(\/[\w-]*)*$/.test(next) ? next : "/admin");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Sign in failed. Please try again.");
      setPassword("");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-mint-deep p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-[12px] bg-white p-8 shadow-card">
        <div className="mb-6 text-center">
          <Image src={brand.logo.full} alt={brand.name} width={800} height={800} priority className="mx-auto mb-2 h-40 w-40 rounded-lg" />
          <h1 className="flex items-center justify-center gap-2 font-serif text-xl text-ink">
            <Lock size={18} className="text-mint-deep" /> Admin
          </h1>
          <p className="mt-1 text-sm text-ink-soft">Sign in to manage your store</p>
        </div>
        <input
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border border-ink/20 px-3 py-3 text-sm outline-none focus:border-ink"
        />
        {error && <p className="mt-2 text-xs text-wine">{error}</p>}
        <button disabled={loading} className="btn-gold mt-4 w-full justify-center">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
