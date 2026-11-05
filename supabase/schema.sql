-- Optional order storage. Run once in the Supabase SQL editor.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  fulfilment text not null check (fulfilment in ('delivery', 'pickup')),
  delivery_address text,
  delivery_area text,
  delivery_instructions text,
  notes text,
  items jsonb not null,
  subtotal integer not null check (subtotal >= 0),
  delivery_fee integer check (delivery_fee >= 0), -- null means "to be confirmed"
  total integer not null check (total >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- Row level security with no policies: the public anon key can read and write nothing.
-- The website reaches this table only from its server, using the service role key.
alter table public.orders enable row level security;
