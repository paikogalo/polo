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
