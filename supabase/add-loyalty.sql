-- À exécuter dans le SQL Editor de Supabase (après schema.sql).

alter table clients
  add column if not exists loyalty_points integer not null default 0;

alter table appointments
  add column if not exists loyalty_awarded boolean not null default false;

create table if not exists loyalty_ledger (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete set null,
  points_delta int not null,
  reason text default '',
  created_at timestamptz not null default now()
);
create index if not exists loyalty_ledger_client_idx on loyalty_ledger (client_id);

alter table loyalty_ledger enable row level security;
-- Pas de policy publique : uniquement accessible via le serveur admin
-- (clé service role), comme les notes internes des clientes.
