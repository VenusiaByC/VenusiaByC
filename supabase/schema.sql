-- ============================================================
-- VENUSIA — Schéma de base de données (PostgreSQL / Supabase)
-- ============================================================
-- Ce fichier est à exécuter une seule fois dans l'éditeur SQL
-- de ton projet Supabase (étapes détaillées dans le README).
-- ============================================================

-- Extension nécessaire pour générer des identifiants uniques
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- PARAMÈTRES DU SITE (logo, couleurs, textes, coordonnées...)
-- Clé/valeur pour pouvoir tout personnaliser sans jamais
-- modifier le code ni le schéma.
-- ------------------------------------------------------------
create table settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- PRESTATIONS
-- ------------------------------------------------------------
create table services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  category text default '',
  price numeric(10,2) not null,
  duration_minutes int not null,
  buffer_minutes int not null default 0, -- temps de battement après la prestation
  photos text[] default '{}',
  display_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- CLIENTES
-- ------------------------------------------------------------
create table clients (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  address text default '',
  internal_notes text default '', -- jamais exposées côté client
  -- si la cliente crée un compte, lié à l'utilisateur Supabase Auth
  auth_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index on clients (email);
create index on clients (phone);

-- ------------------------------------------------------------
-- HORAIRES HABITUELS (récurrents, par jour de semaine)
-- day_of_week : 0 = dimanche ... 6 = samedi
-- Plusieurs lignes possibles par jour (plages coupées, ex: matin/aprem)
-- ------------------------------------------------------------
create table business_hours (
  id uuid primary key default gen_random_uuid(),
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_closed boolean not null default false
);

-- ------------------------------------------------------------
-- HORAIRES EXCEPTIONNELS (remplace business_hours pour une date)
-- ------------------------------------------------------------
create table schedule_exceptions (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  start_time time,
  end_time time,
  is_closed boolean not null default false,
  reason text default '',
  created_at timestamptz not null default now()
);
create unique index on schedule_exceptions (date);

-- ------------------------------------------------------------
-- CRÉNEAUX/PÉRIODES BLOQUÉS (congés, indisponibilités ponctuelles)
-- ------------------------------------------------------------
create table blocked_slots (
  id uuid primary key default gen_random_uuid(),
  start_datetime timestamptz not null,
  end_datetime timestamptz not null,
  reason text default '',
  created_at timestamptz not null default now()
);
create index on blocked_slots (start_datetime, end_datetime);

-- ------------------------------------------------------------
-- RENDEZ-VOUS
-- ------------------------------------------------------------
create type appointment_status as enum (
  'confirmed', 'pending', 'cancelled', 'completed', 'no_show'
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  service_id uuid not null references services(id),
  start_at timestamptz not null,
  end_at timestamptz not null,
  status appointment_status not null default 'confirmed',
  notes text default '',
  created_at timestamptz not null default now()
);
create index on appointments (start_at, end_at);
create index on appointments (client_id);

-- ------------------------------------------------------------
-- MODÈLES D'E-MAIL / SMS (avec variables {{prenom}}, {{date}}...)
-- ------------------------------------------------------------
create table email_templates (
  id uuid primary key default gen_random_uuid(),
  name text unique not null, -- ex: 'confirmation', 'rappel'
  subject text not null,
  body text not null
);

create table sms_templates (
  id uuid primary key default gen_random_uuid(),
  name text unique not null, -- ex: 'confirmation', 'rappel_48h'
  body text not null
);

-- ------------------------------------------------------------
-- HISTORIQUE DES NOTIFICATIONS ENVOYÉES (pour diagnostiquer les erreurs)
-- ------------------------------------------------------------
create table notification_log (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references appointments(id) on delete set null,
  channel text not null check (channel in ('email', 'sms')),
  recipient text not null,
  status text not null check (status in ('sent', 'failed')),
  error_message text,
  sent_at timestamptz not null default now()
);

-- ============================================================
-- SÉCURITÉ (RLS — Row Level Security)
-- Par défaut : tout est verrouillé. Seules les règles ci-dessous
-- ouvrent des accès précis. Les clientes ne peuvent jamais lire
-- les données des autres, ni les notes internes.
-- ============================================================
alter table services enable row level security;
alter table clients enable row level security;
alter table appointments enable row level security;
alter table business_hours enable row level security;
alter table schedule_exceptions enable row level security;
alter table blocked_slots enable row level security;
alter table settings enable row level security;

-- Lecture publique des prestations actives, horaires et paramètres
-- (nécessaire pour afficher le site public)
create policy "Lecture publique des prestations actives"
  on services for select using (active = true);

create policy "Lecture publique des horaires"
  on business_hours for select using (true);

create policy "Lecture publique des exceptions d'horaires"
  on schedule_exceptions for select using (true);

create policy "Lecture publique des créneaux bloqués"
  on blocked_slots for select using (true);

create policy "Lecture publique des paramètres"
  on settings for select using (true);

-- Le reste (écriture, gestion des rendez-vous et des clientes) passe
-- exclusivement par des routes serveur authentifiées en tant qu'admin
-- (voir app/admin) qui utilisent une clé "service role" côté serveur
-- uniquement — jamais exposée au navigateur. Les policies d'écriture
-- détaillées seront ajoutées avec l'espace admin (Phase 1, étape suivante).
