"use client";
// Paginated admin list state kept in the URL (?page=2&q=silk…), so refresh / back /
// sharing keep your place. Fetches only the current page from an /api/admin/* route.
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Paged } from "@/lib/admin-list";

export function useAdminList<T>(endpoint: string, defaults: Record<string, string> = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const get = (k: string) => sp.get(k) ?? defaults[k] ?? "";
  const params = { page: Number(get("page")) || 1, pageSize: Number(get("pageSize")) || Number(defaults.pageSize) || 24, get };

  const [data, setData] = useState<Paged<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState(get("q"));
  const req = useRef(0);

  /** Update URL params; anything other than page/view resets to page 1. */
  const setParams = useCallback((next: Record<string, string | number | null>) => {
    const q = new URLSearchParams(sp.toString());
    let resetPage = false;
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === "" || String(v) === defaults[k]) q.delete(k);
      else q.set(k, String(v));
      if (k !== "page" && k !== "view") resetPage = true;
    }
    if (resetPage) q.delete("page");
    const s = q.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp, pathname, router]);

  // debounce typing in the search box
  useEffect(() => {
    if (searchText === get("q")) return;
    const t = setTimeout(() => setParams({ q: searchText.trim() }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const apiQuery = (() => {
    const q = new URLSearchParams(sp.toString());
    q.delete("view");
    if (!q.get("pageSize") && defaults.pageSize) q.set("pageSize", defaults.pageSize);
    return q.toString();
  })();

  const load = useCallback(async () => {
    const id = ++req.current;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${endpoint}?${apiQuery}`, { cache: "no-store" });
      if (res.status === 401) { window.location.href = `/admin/login?next=${encodeURIComponent(pathname)}`; return; }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not load");
      if (id === req.current) setData(json); // ignore out-of-date responses
    } catch (e) {
      if (id === req.current) setError(e instanceof Error ? e.message : "Could not load");
    } finally {
      if (id === req.current) setLoading(false);
    }
  }, [endpoint, apiQuery, pathname]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, reload: load, params, setParams, searchText, setSearchText };
}
