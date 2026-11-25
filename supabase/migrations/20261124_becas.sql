-- =====================================================================
-- Becas De Polo a Polo (registro de interés, mayores de 18 años)
-- Tabla separada. Sin políticas públicas: solo el servidor (service role)
-- inserta; los administradores leen y gestionan.
-- =====================================================================
create table if not exists public.becas_registros (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  codigo text unique not null,
  cedula text not null,
  nombres text not null,
  apellidos text not null,
  fecha_nacimiento date not null,
  edad smallint not null check (edad >= 18),
  celular text not null,
  correo text,
  provincia text not null,
  canton text,
  parroquia text not null,
  zona text,
  nivel text not null,
  carrera text not null,
  modalidad text,
  tipo_estudiante text,
  prioridad_violencia text check (prioridad_violencia in ('si','no','nd')),
  prioridad_discapacidad text check (prioridad_discapacidad in ('si','no','nd')),
  consentimiento_datos boolean not null default true,
  consentimiento_sin_garantia boolean not null default true,
  origen text not null default 'web',
  estado text not null default 'nuevo' check (estado in ('nuevo','contactado','verificado','descartado'))
);
create unique index if not exists becas_registros_cedula_uq on public.becas_registros (cedula);
create index if not exists becas_registros_created_idx on public.becas_registros (created_at desc);
create index if not exists becas_registros_canton_idx on public.becas_registros (canton);
alter table public.becas_registros enable row level security;
drop policy if exists "admins_manage_becas_registros" on public.becas_registros;
create policy "admins_manage_becas_registros" on public.becas_registros for all to authenticated using (public.is_admin()) with check (public.is_admin());
