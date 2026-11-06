# Boutique Storefront — Next.js clone

A faithful **design/UX clone** of a Shopify women's-wear storefront (reference: uzhamagal.in),
rebuilt from scratch in **Next.js 14 (App Router)** with a working **admin panel**.

> **Branding note:** This is a template. It uses an original placeholder brand
> (**"Nila & Co."**), placeholder copy, and neutral placeholder images
> (picsum.photos) instead of the reference store's trademarked name, logo, product
> photography, or marketing text. Swap your own brand in `src/lib/brand.ts` and
> real product images via the admin panel. The *look, layout, animations and UX*
> mirror the reference; the *brand identity* is yours to fill in.

## What was captured from the reference (via Playwright)

- **Fonts:** Libre Baskerville (headings, serif) + DM Sans (body)
- **Palette:** mint-green header (`#d2e5da`), ink text (`#121212`), cream sections,
  wine sale badges, **gold-gradient CTA buttons**
- **Structure:** announcement bar → mint header (Home / Collection ▾ / Immediate
  Dispatch / Exclusive Drops / search / account / cart) → full-bleed hero → New
  Launches → Exclusive Drops → "What's Your Fashion Mood?" grid → Immediate
  Dispatch → Best Deal → promo band → Restocked → Wall of Love → Shop Instagram →
  Visit Our Store → footer → floating WhatsApp button

## Tech stack

| Concern      | Choice |
|--------------|--------|
| Framework    | Next.js 14 (App Router, TypeScript) |
| Styling      | Tailwind CSS (design tokens in `tailwind.config.ts`) |
| Animation    | Framer Motion (scroll reveals, hero, cart drawer, hover) |
| Carousels    | Embla Carousel (+ autoplay) |
| Cart state   | Zustand (persisted to localStorage) |
| Icons        | lucide-react |
| Data         | JSON file store (`data/store.json`) via API routes + `src/lib/db.ts` |

## Routes

**Storefront** (`src/app/(shop)`)
- `/` — home (all sections, animated)
- `/collections/[handle]` — collection grid
- `/products/[handle]` — product detail (gallery, sizes, add-to-cart)
- `/cart` — cart + checkout form (places real orders)
- `/search?q=` — product search
- `/account/login` — customer login/register (UI)

**Admin** (`src/app/admin`, cookie-protected via `src/middleware.ts`)
- `/admin/login` — password sign-in (demo password: **admin123**)
- `/admin` — dashboard (revenue, orders, stock KPIs, recent orders)
- `/admin/products` — full CRUD (create / edit / delete, modal editor)
- `/admin/collections` — full CRUD
- `/admin/orders` — view orders, change status, delete

**API** (`src/app/api`) — `products`, `collections`, `orders` (GET/POST/PATCH/DELETE), `admin/login`

## Running

```bash
npm install
npm run build        # production build (uses less memory than `npm run dev`)
PORT=3100 npm start  # serve at http://localhost:3100
# or: npm run dev    # hot-reload dev server
```

Data seeds automatically on first run (`src/lib/seed-data.ts` → `data/store.json`).
Delete `data/store.json` to reset to seed.

## Customising

- **Brand / socials / address:** `src/lib/brand.ts`
- **Colors / fonts:** `tailwind.config.ts` + `src/app/layout.tsx`
- **Admin password:** set `ADMIN_PASSWORD` env var (defaults to `admin123`)
- **Products / collections:** manage live in the admin panel

## Production notes (before going live)

- Replace the JSON file store with a real database (Postgres/SQLite) — the
  `src/lib/db.ts` interface is small and swappable.
- Replace the demo cookie auth with a real auth provider + hashed secrets.
- Wire a real payment gateway into `/cart` checkout.
- Swap placeholder images/brand for your own licensed assets.
