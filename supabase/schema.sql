-- ============================================
-- Schema MTC Acupuntura
-- Ejecutar en Supabase SQL Editor en orden
-- ============================================

-- 1. Tabla de pacientes
create table pacientes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  nombre text not null,
  apellidos text,
  telefono text,
  email text,
  fecha_nacimiento date,
  motivo_consulta text,
  notas_generales text,
  created_at timestamptz default now()
);

alter table pacientes enable row level security;
create policy "Solo el propietario accede" on pacientes for all
  using (auth.uid() = user_id);

-- 2. Tabla de anamnesis
create table anamnesis (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid references pacientes(id) on delete cascade not null,
  fecha date not null,

  -- Datos MTC - Pulso
  pulso_posicion_1 text,
  pulso_posicion_2 text,
  pulso_posicion_3 text,
  pulso_descripcion text,

  -- Datos MTC - Lengua
  lengua_cuerpo text,
  lengua_saburra text,
  lengua_forma text,
  lengua_humedad text,
  lengua_notas text,

  -- Cuestionario general
  sueno text,
  digestion text,
  energia text,
  dolor text,
  emociones text,
  ciclo_menstrual text,
  otros text,

  created_at timestamptz default now()
);

alter table anamnesis enable row level security;
create policy "Solo el propietario accede" on anamnesis for all
  using (
    exists (
      select 1 from pacientes
      where pacientes.id = anamnesis.paciente_id
      and pacientes.user_id = auth.uid()
    )
  );

-- 3. Tabla de citas
create table citas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  paciente_id uuid references pacientes(id) on delete cascade not null,
  fecha_hora timestamptz not null,
  duracion_minutos int default 60,
  estado text default 'pendiente',
  notas text,
  created_at timestamptz default now()
);

alter table citas enable row level security;
create policy "Solo el propietario accede" on citas for all
  using (auth.uid() = user_id);

-- 4. Tabla de sesiones
create table sesiones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  cita_id uuid references citas(id),
  paciente_id uuid references pacientes(id) not null,
  fecha date not null,

  tratamiento_tipo text[] default '{}',
  puntos_acupuntura text,
  aceites_usados text,

  timer_inicio timestamptz,
  timer_duracion_minutos int default 35,

  pulso_inicio text,
  pulso_medio text,
  pulso_final text,

  notas_sesion text,
  estado text default 'en_curso',

  created_at timestamptz default now()
);

alter table sesiones enable row level security;
create policy "Solo el propietario accede" on sesiones for all
  using (auth.uid() = user_id);

-- 5. Tabla de plantillas
create table plantillas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  nombre text not null,
  descripcion text,
  contenido_alimentacion text,
  contenido_habitos text,
  contenido_ejercicios text,
  contenido_suplementos text,
  created_at timestamptz default now()
);

alter table plantillas enable row level security;
create policy "Solo el propietario accede" on plantillas for all
  using (auth.uid() = user_id);

-- 6. Tabla de protocolos
create table protocolos (
  id uuid primary key default gen_random_uuid(),
  sesion_id uuid references sesiones(id),
  paciente_id uuid references pacientes(id) not null,

  recomendaciones_alimentacion text,
  recomendaciones_habitos text,
  ejercicios text,
  suplementos text,
  notas_adicionales text,

  plantilla_id uuid references plantillas(id),

  created_at timestamptz default now()
);

alter table protocolos enable row level security;
create policy "Solo el propietario accede" on protocolos for all
  using (
    exists (
      select 1 from pacientes
      where pacientes.id = protocolos.paciente_id
      and pacientes.user_id = auth.uid()
    )
  );

-- 7. Tabla de archivos
create table archivos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid references pacientes(id) on delete cascade not null,
  nombre text not null,
  tipo text,
  url text not null,
  notas text,
  fecha date,
  created_at timestamptz default now()
);

alter table archivos enable row level security;
create policy "Solo el propietario accede" on archivos for all
  using (
    exists (
      select 1 from pacientes
      where pacientes.id = archivos.paciente_id
      and pacientes.user_id = auth.uid()
    )
  );

-- 8. Bucket de storage para archivos (ejecutar por separado si es necesario)
-- insert into storage.buckets (id, name, public) values ('archivos-pacientes', 'archivos-pacientes', false);
