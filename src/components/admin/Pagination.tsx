"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PAGE_SIZES } from "@/lib/admin-list";

/** "Showing 25–48 of 312" + numbered pages (with … gaps) + per-page size. */
export function Pagination({ page, pageSize, total, onPage, onPageSize }: {
  page: number; pageSize: number; total: number; onPage: (p: number) => void; onPageSize: (n: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const first = total ? (page - 1) * pageSize + 1 : 0;
  const last = Math.min(total, page * pageSize);
  const nums: (number | "…")[] = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== "…") nums.push("…");
  }
  const btn = "flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm transition disabled:opacity-40";
  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-ink-soft">
        {total ? <>Showing <strong className="text-ink">{first}–{last}</strong> of <strong className="text-ink">{total}</strong></> : "Nothing to show"}
      </p>
      <div className="flex items-center gap-1.5">
        <button type="button" className={`${btn} border-ink/15 bg-white`} disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
          <ChevronLeft size={16} />
        </button>
        {nums.map((n, i) =>
          n === "…" ? (
            <span key={`g${i}`} className="px-1 text-ink-soft">…</span>
          ) : (
            <button
              key={n}
              type="button"
              onClick={() => onPage(n)}
              aria-current={n === page ? "page" : undefined}
              className={`${btn} ${n === page ? "border-silk bg-silk text-white" : "border-ink/15 bg-white text-ink hover:border-silk/50"}`}
            >
              {n}
            </button>
          )
        )}
        <button type="button" className={`${btn} border-ink/15 bg-white`} disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page">
          <ChevronRight size={16} />
        </button>
      </div>
      <label className="flex items-center gap-2 text-sm text-ink-soft">
        Per page
        <select value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))} className="rounded-lg border border-ink/15 bg-white px-2 py-1.5 text-sm text-ink outline-none">
          {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
    </div>
  );
}
