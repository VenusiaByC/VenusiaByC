-- À exécuter dans le SQL Editor de Supabase (après schema.sql).

alter table appointments
  add column if not exists payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'pending', 'paid')),
  add column if not exists paid_amount numeric(10,2),
  add column if not exists stripe_session_id text;

create table if not exists gift_cards (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  initial_amount numeric(10,2) not null,
  remaining_amount numeric(10,2) not null,
  buyer_name text not null,
  buyer_email text not null,
  recipient_name text default '',
  recipient_email text default '',
  message text default '',
  status text not null default 'pending' check (status in ('pending', 'active', 'used', 'expired')),
  stripe_session_id text,
  created_at timestamptz not null default now()
);
create unique index if not exists gift_cards_code_idx on gift_cards (code);

alter table gift_cards enable row level security;
-- Pas de policy publique : la validation d'un code se fait via une Server
-- Action (clé service role), jamais par lecture directe du navigateur.
