-- À exécuter dans le SQL Editor de Supabase (après schema.sql).
-- Permet de savoir si le SMS de rappel 48h a déjà été envoyé pour un
-- rendez-vous donné, pour ne jamais l'envoyer deux fois.

alter table appointments
  add column if not exists reminder_sent_at timestamptz;
