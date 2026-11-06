/** Shared helpers for the paginated admin list APIs. */
export const PAGE_SIZES = [12, 24, 48, 96] as const;

export function paging(url: string, defaultSize = 24) {
  const sp = new URL(url).searchParams;
  const size = Number(sp.get("pageSize"));
  const pageSize = (PAGE_SIZES as readonly number[]).includes(size) ? size : defaultSize;
  const page = Math.max(1, Math.floor(Number(sp.get("page")) || 1));
  const from = (page - 1) * pageSize;
  return { sp, page, pageSize, from, to: from + pageSize - 1 };
}

/** Search text safe to put inside a Supabase/PostgREST ilike filter. */
export function searchTerm(raw: string | null) {
  // keep letters (Latin + Tamil), digits, spaces and + @ . - ; drop anything with filter meaning
  return (raw ?? "").replace(/[^A-Za-z0-9\u0B80-\u0BFF\s+@.-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
}

export type Paged<T> = { items: T[]; total: number; page: number; pageSize: number };
