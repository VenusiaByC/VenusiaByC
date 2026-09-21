-- ============================================================
-- VENUSIA — Stockage des photos de prestations
-- À exécuter dans le SQL Editor de Supabase, APRÈS schema.sql
-- ============================================================

-- Crée le "bucket" (espace de stockage) pour les photos de prestations.
-- Public en lecture : nécessaire pour que les photos s'affichent sur le
-- site sans que les clientes aient besoin d'être connectées.
insert into storage.buckets (id, name, public)
values ('service-photos', 'service-photos', true)
on conflict (id) do nothing;

-- Tout le monde peut voir les photos (elles sont publiques par nature)
create policy "Lecture publique des photos de prestations"
  on storage.objects for select
  using (bucket_id = 'service-photos');

-- Seule une personne connectée (toi, via l'admin) peut en ajouter
create policy "Upload photos par une personne connectée"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'service-photos');

-- Seule une personne connectée peut en supprimer
create policy "Suppression photos par une personne connectée"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'service-photos');
