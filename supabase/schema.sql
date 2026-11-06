-- Boutique storefront schema
create table if not exists collections (
  id text primary key,
  handle text unique not null,
  title text not null,
  image text not null default '',
  description text default '',
  created_at timestamptz default now()
);

create table if not exists products (
  id text primary key,
  handle text unique not null,
  title text not null,
  description text default '',
  price numeric not null default 0,
  compare_at_price numeric,
  images jsonb not null default '[]',
  collections jsonb not null default '[]',
  sizes jsonb not null default '[]',
  tags jsonb not null default '[]',
  immediate_dispatch boolean default false,
  best_deal boolean default false,
  exclusive_drop boolean default false,
  restocked boolean default false,
  new_launch boolean default false,
  in_stock boolean default true,
  created_at timestamptz default now()
);

create table if not exists testimonials (
  id text primary key,
  name text not null,
  text text not null,
  rating int default 5,
  image text default ''
);

create table if not exists orders (
  id text primary key,
  customer_name text not null,
  email text not null,
  phone text default '',
  address text default '',
  items jsonb not null default '[]',
  total numeric not null default 0,
  status text not null default 'pending',
  created_at timestamptz default now()
);

create table if not exists settings (
  id int primary key default 1,
  data jsonb not null default '{}'
);

-- Enable Row Level Security
alter table collections enable row level security;
alter table products enable row level security;
alter table testimonials enable row level security;
alter table orders enable row level security;
alter table settings enable row level security;

-- Public read for storefront content
drop policy if exists "public read collections" on collections;
create policy "public read collections" on collections for select using (true);
drop policy if exists "public read products" on products;
create policy "public read products" on products for select using (true);
drop policy if exists "public read testimonials" on testimonials;
create policy "public read testimonials" on testimonials for select using (true);
drop policy if exists "public read settings" on settings;
create policy "public read settings" on settings for select using (true);

-- Allow anyone to create an order (checkout); no public read of orders
drop policy if exists "public insert orders" on orders;
create policy "public insert orders" on orders for insert with check (true);

-- NOTE: the secret (service_role) key bypasses RLS, so the admin panel
-- (server-side, using the secret key) can read/write everything.
