-- À exécuter dans le SQL Editor de Supabase (après schema.sql).

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  appointment_id uuid unique references appointments(id) on delete cascade,
  author_name text not null,
  rating int not null check (rating between 1 and 5),
  comment text default '',
  published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table reviews enable row level security;

-- Seuls les avis validés par la propriétaire (published = true) sont
-- visibles publiquement. L'écriture se fait uniquement côté serveur
-- (clé service role), pas de policy d'insertion publique nécessaire.
create policy "Lecture publique des avis publiés"
  on reviews for select
  using (published = true);
