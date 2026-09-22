-- À exécuter dans le SQL Editor de Supabase (après schema.sql).

create table if not exists gallery_photos (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text default '',
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table gallery_photos enable row level security;

create policy "Lecture publique de la galerie"
  on gallery_photos for select
  using (true);

-- Stockage des photos de la galerie
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

create policy "Lecture publique des photos de galerie"
  on storage.objects for select
  using (bucket_id = 'gallery');

create policy "Upload galerie par une personne connectée"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'gallery');

create policy "Suppression galerie par une personne connectée"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'gallery');
