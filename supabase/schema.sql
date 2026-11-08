-- Hipólito Carrera · plataforma territorial
create extension if not exists pgcrypto;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$
  select coalesce((auth.jwt()->'app_metadata'->>'role') in ('admin','super_admin'),false)
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
create sequence if not exists public.registration_code_seq start 129;
create type public.report_status as enum ('Nuevo','En revisión','Priorizado','En gestión','Atendido','Archivado');
create table if not exists public.territorial_reports (
  id uuid primary key default gen_random_uuid(), registration_code text unique not null default ('HC-LAT-' || lpad(nextval('public.registration_code_seq')::text,6,'0')), created_at timestamptz not null default now(),
  full_name text, phone text, email text, province text, canton text, parish text, neighborhood text, community text, precinct text, address_reference text,
  category text, urgency text check (urgency is null or urgency in ('Baja','Media','Alta','Urgente')), description text check (char_length(description)<=1500),
  latitude numeric check (latitude between -90 and 90), longitude numeric check (longitude between -180 and 180), status public.report_status not null default 'Nuevo',
  source text not null default 'web', consent boolean not null check (consent=true), assigned_to text, internal_notes text, updated_at timestamptz not null default now()
);
create table if not exists public.report_images (id uuid primary key default gen_random_uuid(), report_id uuid not null references public.territorial_reports(id) on delete cascade, image_url text not null, storage_path text not null, created_at timestamptz not null default now());
create table if not exists public.report_history (id uuid primary key default gen_random_uuid(), report_id uuid not null references public.territorial_reports(id) on delete cascade, changed_by uuid references auth.users(id), field_name text not null, old_value text, new_value text, created_at timestamptz not null default now());
create index if not exists reports_canton_idx on public.territorial_reports(canton);create index if not exists reports_category_idx on public.territorial_reports(category);create index if not exists reports_status_idx on public.territorial_reports(status);create index if not exists reports_created_idx on public.territorial_reports(created_at desc);
alter table public.territorial_reports enable row level security;alter table public.report_images enable row level security;alter table public.report_history enable row level security;
drop policy if exists "public_insert_reports" on public.territorial_reports;
drop policy if exists "admins_read_reports" on public.territorial_reports;
drop policy if exists "admins_update_reports" on public.territorial_reports;
drop policy if exists "admins_all_images" on public.report_images;
drop policy if exists "admins_all_history" on public.report_history;
create policy "public_insert_reports" on public.territorial_reports for insert to anon with check (consent=true);
create policy "admins_read_reports" on public.territorial_reports for select to authenticated using (public.is_admin());
create policy "admins_update_reports" on public.territorial_reports for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins_all_images" on public.report_images for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins_all_history" on public.report_history for all to authenticated using (public.is_admin()) with check (public.is_admin());
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types) values ('report-images','report-images',false,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do update set public=false,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
drop policy if exists "authenticated_read_report_images" on storage.objects;
drop policy if exists "service_upload_report_images" on storage.objects;
create policy "authenticated_read_report_images" on storage.objects for select to authenticated using (bucket_id='report-images' and public.is_admin());
create policy "service_upload_report_images" on storage.objects for insert to service_role with check (bucket_id='report-images');

-- Comunidad registrada: datos privados, confirmación de correo y consentimiento.
create table if not exists public.community_members (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text unique not null,
  phone text,
  canton text,
  parish text,
  neighborhood text,
  age_range text check (age_range is null or age_range in ('18–24','25–34','35–44','45–54','55 o más')),
  gender text check (gender is null or gender in ('Mujer','Hombre','Otro','Prefiero no indicar')),
  interests text[] not null default '{}',
  source text not null default 'web' check (source in ('web','ios','android')),
  consent_communications boolean not null,
  consent_version text not null default 'community-v1',
  confirmation_token_hash text unique,
  unsubscribe_token_hash text unique,
  confirmation_sent_at timestamptz,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz
);
alter table public.community_members add column if not exists parish text;
alter table public.community_members add column if not exists neighborhood text;
alter table public.community_members add column if not exists gender text;
alter table public.community_members add column if not exists consent_version text not null default 'community-v1';
alter table public.community_members drop constraint if exists community_members_gender_check;
alter table public.community_members add constraint community_members_gender_check check (gender is null or gender in ('Mujer','Hombre','Otro','Prefiero no indicar'));
alter table public.community_members drop constraint if exists community_members_consent_communications_check;
create index if not exists community_members_created_idx on public.community_members(created_at desc);
create index if not exists community_members_canton_idx on public.community_members(canton);
create index if not exists community_members_parish_idx on public.community_members(parish);
create index if not exists community_members_neighborhood_idx on public.community_members(neighborhood);
create index if not exists community_members_age_idx on public.community_members(age_range);
create index if not exists community_members_gender_idx on public.community_members(gender);
alter table public.community_members enable row level security;
drop policy if exists "admins_read_community_members" on public.community_members;
create policy "admins_read_community_members" on public.community_members for select to authenticated using (public.is_admin());

-- Solicitudes pendientes: el perfil se aplica solamente después de confirmar el correo.
create table if not exists public.community_registration_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now()+interval '24 hours'),
  full_name text not null,
  email text not null,
  phone text,
  canton text,
  parish text,
  neighborhood text,
  age_range text check (age_range is null or age_range in ('18–24','25–34','35–44','45–54','55 o más')),
  gender text check (gender is null or gender in ('Mujer','Hombre','Otro','Prefiero no indicar')),
  interests text[] not null default '{}',
  source text not null default 'web' check (source in ('web','ios','android')),
  consent_communications boolean not null check (consent_communications=true),
  consent_version text not null default 'community-v1',
  confirmation_token_hash text unique not null,
  unsubscribe_token_hash text unique not null
);
alter table public.community_registration_requests add column if not exists parish text;
alter table public.community_registration_requests add column if not exists neighborhood text;
alter table public.community_registration_requests add column if not exists gender text;
alter table public.community_registration_requests add column if not exists consent_version text not null default 'community-v1';
alter table public.community_registration_requests drop constraint if exists community_registration_requests_gender_check;
alter table public.community_registration_requests add constraint community_registration_requests_gender_check check (gender is null or gender in ('Mujer','Hombre','Otro','Prefiero no indicar'));
drop index if exists public.community_requests_email_idx;
delete from public.community_registration_requests
where id in (
  select id from (
    select id,row_number() over (partition by email order by created_at desc,id desc) as duplicate_position
    from public.community_registration_requests
  ) ranked where duplicate_position>1
);
create unique index if not exists community_requests_email_unique_idx on public.community_registration_requests(email);
create index if not exists community_requests_expiry_idx on public.community_registration_requests(expires_at);
alter table public.community_registration_requests enable row level security;

-- Confirma y mueve la solicitud en una sola transacción. Solo el servidor con
-- service_role puede ejecutar esta función; los datos pendientes no son públicos.
create or replace function public.confirm_community_member(p_token_hash text)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare
  pending public.community_registration_requests%rowtype;
  member_id uuid;
begin
  select * into pending
  from public.community_registration_requests
  where confirmation_token_hash=p_token_hash and expires_at>now()
  for update;

  if not found then return null; end if;

  insert into public.community_members (
    full_name,email,phone,canton,parish,neighborhood,age_range,gender,interests,source,
    consent_communications,consent_version,confirmation_token_hash,unsubscribe_token_hash,
    confirmation_sent_at,confirmed_at,unsubscribed_at
  ) values (
    pending.full_name,pending.email,pending.phone,pending.canton,pending.parish,pending.neighborhood,
    pending.age_range,pending.gender,pending.interests,pending.source,true,pending.consent_version,
    null,pending.unsubscribe_token_hash,pending.created_at,now(),null
  )
  on conflict (email) do update set
    full_name=excluded.full_name,
    phone=excluded.phone,
    canton=excluded.canton,
    parish=excluded.parish,
    neighborhood=excluded.neighborhood,
    age_range=excluded.age_range,
    gender=excluded.gender,
    interests=excluded.interests,
    source=excluded.source,
    consent_communications=true,
    consent_version=excluded.consent_version,
    confirmation_token_hash=null,
    unsubscribe_token_hash=excluded.unsubscribe_token_hash,
    confirmation_sent_at=excluded.confirmation_sent_at,
    confirmed_at=now(),
    unsubscribed_at=null
  returning id into member_id;

  delete from public.community_registration_requests where id=pending.id;
  return member_id;
end;
$$;
revoke all on function public.confirm_community_member(text) from public,anon,authenticated;
grant execute on function public.confirm_community_member(text) to service_role;

-- Tokens de notificaciones: nunca se exponen públicamente.
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  token text unique not null,
  platform text not null check (platform in ('ios','android','web')),
  email text,
  source text not null default 'app',
  consent boolean not null check (consent=true),
  consent_version text not null default '1',
  last_active_at timestamptz not null default now(),
  disabled_at timestamptz
);
alter table public.push_subscriptions add column if not exists source text not null default 'app';
alter table public.push_subscriptions add column if not exists consent_version text not null default '1';
alter table public.push_subscriptions enable row level security;
drop policy if exists "admins_read_push_subscriptions" on public.push_subscriptions;
create policy "admins_read_push_subscriptions" on public.push_subscriptions for select to authenticated using (public.is_admin());

-- Novedades sincronizadas desde las cuentas oficiales mediante webhook/automatización.
create table if not exists public.social_updates (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  platform text not null,
  title text not null,
  excerpt text not null default '',
  url text not null,
  image_url text,
  published_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists social_updates_published_idx on public.social_updates(published_at desc);
alter table public.social_updates enable row level security;
drop policy if exists "admins_manage_social_updates" on public.social_updates;
create policy "admins_manage_social_updates" on public.social_updates for all to authenticated using (public.is_admin()) with check (public.is_admin());
-- Datos de ejemplo (ejecutar solo en desarrollo)
insert into public.territorial_reports(full_name,province,canton,parish,category,urgency,description,status,consent) values
('María Toapanta','Cotopaxi','Latacunga','Mulaló','Vialidad y caminos','Urgente','El camino se vuelve intransitable durante las lluvias.','Nuevo',true),
('Carlos Chiguano','Cotopaxi','La Maná','Guasaganda','Riego','Alta','Rehabilitación del canal de riego comunitario.','En revisión',true),
('Ana Tipán','Cotopaxi','Pujilí','Zumbahua','Producción','Media','Feria mensual para productores locales.','Atendido',true);

-- =====================================================================
-- NODO · Jóvenes Cotopaxi (registro para el piloto, 16 a 30 años)
-- Tabla separada: no se mezcla con comunidad ni con listas de difusión.
-- Sin políticas públicas: solo el servidor (service role) inserta, lee y borra.
-- =====================================================================
create table if not exists public.nodo_registros (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  created_at timestamptz not null default now(),
  nombres text not null,
  fecha_nacimiento date not null,
  edad smallint not null check (edad between 16 and 30),
  genero text,
  canton text not null check (canton in ('Latacunga','Pujilí','Salcedo','Saquisilí','Sigchos','La Maná','Pangua')),
  parroquia text not null,
  comunidad_barrio text,
  correo text not null,
  whatsapp text not null,
  estudios text,
  ocupacion text,
  intereses text[] not null,
  etapa text not null,
  idea text,
  necesidad text,
  participaria_piloto boolean not null,
  como_nos_conociste text,
  consentimiento_datos boolean not null check (consentimiento_datos),
  consentimiento_sin_garantia boolean not null check (consentimiento_sin_garantia),
  consentimiento_adolescente boolean,
  acepta_novedades boolean not null default false,
  origen text not null default 'web',          -- web | app
  utm_source text, utm_medium text, utm_campaign text,
  estado text not null default 'nuevo',        -- nuevo | contactado | seleccionado_piloto | descartado
  notas_internas text,
  constraint nodo_registros_estado_ck check (estado in ('nuevo','contactado','seleccionado_piloto','descartado')),
  constraint nodo_registros_adolescente_ck check (edad >= 18 or consentimiento_adolescente is true)
);
create unique index if not exists nodo_registros_correo_uq on public.nodo_registros (lower(correo));
create index if not exists nodo_registros_canton_idx on public.nodo_registros (canton);
create index if not exists nodo_registros_created_idx on public.nodo_registros (created_at desc);
alter table public.nodo_registros enable row level security;
-- Sin políticas públicas de lectura. La inserción se hace solo desde la ruta de servidor con service role.

-- Enlaces de confirmación para el derecho de eliminación (/nodo/mis-datos). Se borran en cascada con el registro.
create table if not exists public.nodo_borrado_tokens (
  id uuid primary key default gen_random_uuid(),
  registro_id uuid not null references public.nodo_registros(id) on delete cascade,
  token_hash text unique not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
alter table public.nodo_borrado_tokens enable row level security;
