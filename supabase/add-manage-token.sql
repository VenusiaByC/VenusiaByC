-- À exécuter dans le SQL Editor de Supabase (après schema.sql).

alter table appointments
  add column if not exists manage_token uuid not null default gen_random_uuid();

create unique index if not exists appointments_manage_token_idx on appointments (manage_token);
