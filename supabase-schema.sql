-- ============================================
-- ESQUEMA COMPLETO - EstiloPat (MTC Acupuntura)
-- Ejecutar en Supabase → SQL Editor
-- ============================================

-- 1. TABLA: pacientes
CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terapeuta_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  fecha_nacimiento DATE,
  sexo TEXT CHECK (sexo IN ('mujer', 'hombre', 'otro', 'no_especificado')),
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  ocupacion TEXT,
  fecha_alta DATE DEFAULT CURRENT_DATE,
  motivo_principal TEXT,
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'alta')),
  etiquetas TEXT[] DEFAULT '{}',
  alertas TEXT,
  observaciones_generales TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA: visitas
CREATE TABLE visitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE NOT NULL,
  terapeuta_id UUID REFERENCES auth.users(id) NOT NULL,
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  numero_visita INTEGER,
  motivo_visita TEXT,
  estado TEXT DEFAULT 'borrador' CHECK (estado IN ('borrador', 'completada')),
  notas_generales TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: anamnesis
CREATE TABLE anamnesis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visita_id UUID REFERENCES visitas(id) ON DELETE CASCADE NOT NULL,
  motivo_consulta TEXT,
  sintomas_principales TEXT,
  evolucion TEXT,
  antecedentes TEXT,
  digestivo TEXT,
  sueno TEXT,
  energia TEXT,
  estado_emocional TEXT,
  habitos TEXT,
  ejercicio TEXT,
  alimentacion TEXT,
  menstruacion TEXT,
  valores_analiticos TEXT,
  observaciones_libres TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: exploracion_lengua
CREATE TABLE exploracion_lengua (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visita_id UUID REFERENCES visitas(id) ON DELETE CASCADE NOT NULL,
  imagen_url TEXT,
  color_cuerpo TEXT,
  forma TEXT,
  saburra TEXT,
  humedad TEXT,
  marcas TEXT,
  etiquetas TEXT[] DEFAULT '{}',
  notas_libres TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA: exploracion_pulso
CREATE TABLE exploracion_pulso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visita_id UUID REFERENCES visitas(id) ON DELETE CASCADE NOT NULL,
  izq_cun TEXT,
  izq_guan TEXT,
  izq_chi TEXT,
  dcha_cun TEXT,
  dcha_guan TEXT,
  dcha_chi TEXT,
  cualidades TEXT[] DEFAULT '{}',
  ritmo TEXT,
  fuerza TEXT,
  profundidad TEXT,
  notas_libres TEXT,
  momento TEXT CHECK (momento IN ('inicio', 'durante', 'final')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA: exploracion_observacion
CREATE TABLE exploracion_observacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visita_id UUID REFERENCES visitas(id) ON DELETE CASCADE NOT NULL,
  constitucion TEXT,
  voz TEXT,
  piel TEXT,
  ojos TEXT,
  abdomen TEXT,
  signos_fisicos TEXT,
  otras_observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLA: sintesis_clinica
CREATE TABLE sintesis_clinica (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visita_id UUID REFERENCES visitas(id) ON DELETE CASCADE NOT NULL,
  resumen_datos TEXT,
  diagnostico_energetico TEXT,
  patrones_sindromes TEXT[] DEFAULT '{}',
  terreno TEXT,
  hipotesis_clinica TEXT,
  prioridades_terapeuticas TEXT,
  relacion_integrativa TEXT,
  evolucion_respecto_anterior TEXT,
  objetivos_tratamiento TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABLA: tratamiento_sesion
CREATE TABLE tratamiento_sesion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visita_id UUID REFERENCES visitas(id) ON DELETE CASCADE NOT NULL,
  puntos_acupuntura TEXT[] DEFAULT '{}',
  moxa BOOLEAN DEFAULT FALSE,
  moxa_notas TEXT,
  tuina BOOLEAN DEFAULT FALSE,
  tuina_notas TEXT,
  aceites_esenciales TEXT[] DEFAULT '{}',
  ventosas BOOLEAN DEFAULT FALSE,
  ventosas_notas TEXT,
  otras_tecnicas TEXT,
  observaciones_tratamiento TEXT,
  respuesta_paciente TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABLA: protocolo_seguimiento
CREATE TABLE protocolo_seguimiento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visita_id UUID REFERENCES visitas(id) ON DELETE CASCADE NOT NULL,
  paciente_id UUID REFERENCES pacientes(id) NOT NULL,
  plantilla_id UUID,
  alimentacion TEXT,
  habitos_vida TEXT,
  exposicion_solar TEXT,
  descanso TEXT,
  deporte_movimiento TEXT,
  respiraciones TEXT,
  practicas_regulacion TEXT,
  aceites_esenciales TEXT,
  suplementos TEXT,
  fitoterapia_china TEXT,
  otras_recomendaciones TEXT,
  notas_adicionales TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TABLA: plantillas
CREATE TABLE plantillas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terapeuta_id UUID REFERENCES auth.users(id) NOT NULL,
  nombre TEXT NOT NULL,
  categoria TEXT,
  contenido JSONB DEFAULT '{}',
  descripcion TEXT,
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TABLA: documentos
CREATE TABLE documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE NOT NULL,
  visita_id UUID REFERENCES visitas(id),
  terapeuta_id UUID REFERENCES auth.users(id) NOT NULL,
  tipo TEXT CHECK (tipo IN ('analitica', 'informe', 'imagen', 'cuestionario', 'otro')),
  nombre TEXT NOT NULL,
  archivo_url TEXT NOT NULL,
  fecha_documento DATE,
  notas TEXT,
  interpretacion_clinica TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Foreign key de protocolo_seguimiento -> plantillas (después de crear ambas tablas)
ALTER TABLE protocolo_seguimiento
  ADD CONSTRAINT fk_protocolo_plantilla FOREIGN KEY (plantilla_id) REFERENCES plantillas(id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-calcular numero_visita
CREATE OR REPLACE FUNCTION set_numero_visita()
RETURNS TRIGGER AS $$
BEGIN
  SELECT COALESCE(MAX(numero_visita), 0) + 1 INTO NEW.numero_visita
  FROM visitas
  WHERE paciente_id = NEW.paciente_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_numero_visita
  BEFORE INSERT ON visitas
  FOR EACH ROW EXECUTE FUNCTION set_numero_visita();

-- Auto-actualizar updated_at en pacientes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pacientes_updated_at
  BEFORE UPDATE ON pacientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_visitas_updated_at
  BEFORE UPDATE ON visitas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_plantillas_updated_at
  BEFORE UPDATE ON plantillas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE anamnesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE exploracion_lengua ENABLE ROW LEVEL SECURITY;
ALTER TABLE exploracion_pulso ENABLE ROW LEVEL SECURITY;
ALTER TABLE exploracion_observacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE sintesis_clinica ENABLE ROW LEVEL SECURITY;
ALTER TABLE tratamiento_sesion ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocolo_seguimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE plantillas ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

-- Políticas para pacientes
CREATE POLICY terapeuta_own_pacientes ON pacientes
  FOR ALL USING (auth.uid() = terapeuta_id)
  WITH CHECK (auth.uid() = terapeuta_id);

-- Políticas para visitas
CREATE POLICY terapeuta_own_visitas ON visitas
  FOR ALL USING (auth.uid() = terapeuta_id)
  WITH CHECK (auth.uid() = terapeuta_id);

-- Políticas para plantillas
CREATE POLICY terapeuta_own_plantillas ON plantillas
  FOR ALL USING (auth.uid() = terapeuta_id)
  WITH CHECK (auth.uid() = terapeuta_id);

-- Políticas para documentos
CREATE POLICY terapeuta_own_documentos ON documentos
  FOR ALL USING (auth.uid() = terapeuta_id)
  WITH CHECK (auth.uid() = terapeuta_id);

-- Políticas para tablas hijas (acceso via visita)
CREATE POLICY terapeuta_own_anamnesis ON anamnesis
  FOR ALL USING (
    EXISTS (SELECT 1 FROM visitas WHERE visitas.id = anamnesis.visita_id AND visitas.terapeuta_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM visitas WHERE visitas.id = anamnesis.visita_id AND visitas.terapeuta_id = auth.uid())
  );

CREATE POLICY terapeuta_own_lengua ON exploracion_lengua
  FOR ALL USING (
    EXISTS (SELECT 1 FROM visitas WHERE visitas.id = exploracion_lengua.visita_id AND visitas.terapeuta_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM visitas WHERE visitas.id = exploracion_lengua.visita_id AND visitas.terapeuta_id = auth.uid())
  );

CREATE POLICY terapeuta_own_pulso ON exploracion_pulso
  FOR ALL USING (
    EXISTS (SELECT 1 FROM visitas WHERE visitas.id = exploracion_pulso.visita_id AND visitas.terapeuta_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM visitas WHERE visitas.id = exploracion_pulso.visita_id AND visitas.terapeuta_id = auth.uid())
  );

CREATE POLICY terapeuta_own_observacion ON exploracion_observacion
  FOR ALL USING (
    EXISTS (SELECT 1 FROM visitas WHERE visitas.id = exploracion_observacion.visita_id AND visitas.terapeuta_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM visitas WHERE visitas.id = exploracion_observacion.visita_id AND visitas.terapeuta_id = auth.uid())
  );

CREATE POLICY terapeuta_own_sintesis ON sintesis_clinica
  FOR ALL USING (
    EXISTS (SELECT 1 FROM visitas WHERE visitas.id = sintesis_clinica.visita_id AND visitas.terapeuta_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM visitas WHERE visitas.id = sintesis_clinica.visita_id AND visitas.terapeuta_id = auth.uid())
  );

CREATE POLICY terapeuta_own_tratamiento ON tratamiento_sesion
  FOR ALL USING (
    EXISTS (SELECT 1 FROM visitas WHERE visitas.id = tratamiento_sesion.visita_id AND visitas.terapeuta_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM visitas WHERE visitas.id = tratamiento_sesion.visita_id AND visitas.terapeuta_id = auth.uid())
  );

CREATE POLICY terapeuta_own_protocolo ON protocolo_seguimiento
  FOR ALL USING (
    EXISTS (SELECT 1 FROM visitas WHERE visitas.id = protocolo_seguimiento.visita_id AND visitas.terapeuta_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM visitas WHERE visitas.id = protocolo_seguimiento.visita_id AND visitas.terapeuta_id = auth.uid())
  );

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Crear buckets de almacenamiento
INSERT INTO storage.buckets (id, name, public) VALUES ('documentos-pacientes', 'documentos-pacientes', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('imagenes-lengua', 'imagenes-lengua', false);

-- Políticas de storage para documentos-pacientes
CREATE POLICY "terapeuta_upload_docs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documentos-pacientes' AND auth.role() = 'authenticated'
  );

CREATE POLICY "terapeuta_read_docs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documentos-pacientes' AND auth.role() = 'authenticated'
  );

CREATE POLICY "terapeuta_delete_docs" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documentos-pacientes' AND auth.role() = 'authenticated'
  );

-- Políticas de storage para imagenes-lengua
CREATE POLICY "terapeuta_upload_lengua" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'imagenes-lengua' AND auth.role() = 'authenticated'
  );

CREATE POLICY "terapeuta_read_lengua" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'imagenes-lengua' AND auth.role() = 'authenticated'
  );

CREATE POLICY "terapeuta_delete_lengua" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'imagenes-lengua' AND auth.role() = 'authenticated'
  );

-- Política de storage para UPDATE (necesaria para sobrescribir archivos)
CREATE POLICY "terapeuta_update_docs" ON storage.objects
  FOR UPDATE USING (
    bucket_id IN ('documentos-pacientes', 'imagenes-lengua') AND auth.role() = 'authenticated'
  );
