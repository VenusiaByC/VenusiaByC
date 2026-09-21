-- À exécuter dans le SQL Editor de Supabase (après schema.sql et
-- storage-setup.sql). Crée un espace de stockage séparé pour les éléments
-- d'identité visuelle du site (logo...).

insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

create policy "Lecture publique des assets du site"
  on storage.objects for select
  using (bucket_id = 'site-assets');

create policy "Upload assets du site par une personne connectée"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-assets');

create policy "Suppression assets du site par une personne connectée"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-assets');
