// Tipos del dominio clínico — EstiloPat

// =====================
// Enums
// =====================
export type EstadoPaciente = 'activo' | 'inactivo' | 'alta'
export type SexoPaciente = 'mujer' | 'hombre' | 'otro' | 'no_especificado'
export type EstadoVisita = 'borrador' | 'completada'
export type MomentoPulso = 'inicio' | 'durante' | 'final'
export type TipoDocumento = 'analitica' | 'informe' | 'imagen' | 'cuestionario' | 'otro'
export type CategoriaPlantilla =
  | 'alimentacion'
  | 'habitos'
  | 'aceites'
  | 'fitoterapia'
  | 'tratamiento'
  | 'respiracion'
  | 'suplementacion'
  | 'ejercicio'
  | 'otro'

// =====================
// Pacientes
// =====================
export interface Paciente {
  id: string
  terapeuta_id: string
  nombre: string
  apellidos: string
  fecha_nacimiento: string | null
  sexo: SexoPaciente | null
  telefono: string | null
  email: string | null
  direccion: string | null
  ocupacion: string | null
  fecha_alta: string | null
  motivo_principal: string | null
  estado: EstadoPaciente
  etiquetas: string[]
  alertas: string | null
  observaciones_generales: string | null
  created_at: string
  updated_at: string
}

// =====================
// Visitas
// =====================
export interface Visita {
  id: string
  paciente_id: string
  terapeuta_id: string
  fecha: string
  numero_visita: number | null
  motivo_visita: string | null
  estado: EstadoVisita
  notas_generales: string | null
  created_at: string
  updated_at: string
  // Relaciones (opcionales, se cargan bajo demanda)
  paciente?: Paciente
  anamnesis?: Anamnesis
  exploracion_lengua?: ExploracionLengua[]
  exploracion_pulso?: ExploracionPulso[]
  exploracion_observacion?: ExploracionObservacion
  sintesis_clinica?: SintesisClinica
  tratamiento_sesion?: TratamientoSesion
  protocolo_seguimiento?: ProtocoloSeguimiento
}

// =====================
// Anamnesis
// =====================
export interface Anamnesis {
  id: string
  visita_id: string
  motivo_consulta: string | null
  sintomas_principales: string | null
  evolucion: string | null
  antecedentes: string | null
  digestivo: string | null
  sueno: string | null
  energia: string | null
  estado_emocional: string | null
  habitos: string | null
  ejercicio: string | null
  alimentacion: string | null
  menstruacion: string | null
  valores_analiticos: string | null
  observaciones_libres: string | null
  created_at: string
}

// =====================
// Exploración — Lengua
// =====================
export interface ExploracionLengua {
  id: string
  visita_id: string
  imagen_url: string | null
  color_cuerpo: string | null
  forma: string | null
  saburra: string | null
  humedad: string | null
  marcas: string | null
  etiquetas: string[]
  notas_libres: string | null
  created_at: string
}

// =====================
// Exploración — Pulso
// =====================
export interface ExploracionPulso {
  id: string
  visita_id: string
  izq_cun: string | null
  izq_guan: string | null
  izq_chi: string | null
  dcha_cun: string | null
  dcha_guan: string | null
  dcha_chi: string | null
  cualidades: string[]
  ritmo: string | null
  fuerza: string | null
  profundidad: string | null
  notas_libres: string | null
  momento: MomentoPulso | null
  created_at: string
}

// =====================
// Exploración — Observación General
// =====================
export interface ExploracionObservacion {
  id: string
  visita_id: string
  constitucion: string | null
  voz: string | null
  piel: string | null
  ojos: string | null
  abdomen: string | null
  signos_fisicos: string | null
  otras_observaciones: string | null
  created_at: string
}

// =====================
// Síntesis Clínica
// =====================
export interface SintesisClinica {
  id: string
  visita_id: string
  // Capa A — Datos observados
  resumen_datos: string | null
  // Capa B — Interpretación
  diagnostico_energetico: string | null
  patrones_sindromes: string[]
  terreno: string | null
  hipotesis_clinica: string | null
  prioridades_terapeuticas: string | null
  relacion_integrativa: string | null
  evolucion_respecto_anterior: string | null
  // Capa C — Intervención
  objetivos_tratamiento: string | null
  created_at: string
}

// =====================
// Tratamiento en Sesión
// =====================
export interface TratamientoSesion {
  id: string
  visita_id: string
  puntos_acupuntura: string[]
  moxa: boolean
  moxa_notas: string | null
  tuina: boolean
  tuina_notas: string | null
  aceites_esenciales: string[]
  ventosas: boolean
  ventosas_notas: string | null
  otras_tecnicas: string | null
  observaciones_tratamiento: string | null
  respuesta_paciente: string | null
  created_at: string
}

// =====================
// Protocolo de Seguimiento
// =====================
export interface ProtocoloSeguimiento {
  id: string
  visita_id: string
  paciente_id: string
  plantilla_id: string | null
  alimentacion: string | null
  habitos_vida: string | null
  exposicion_solar: string | null
  descanso: string | null
  deporte_movimiento: string | null
  respiraciones: string | null
  practicas_regulacion: string | null
  aceites_esenciales: string | null
  suplementos: string | null
  fitoterapia_china: string | null
  otras_recomendaciones: string | null
  notas_adicionales: string | null
  created_at: string
}

// =====================
// Plantillas
// =====================
export interface Plantilla {
  id: string
  terapeuta_id: string
  nombre: string
  categoria: CategoriaPlantilla | null
  contenido: Record<string, unknown>
  descripcion: string | null
  activa: boolean
  created_at: string
  updated_at: string
}

// =====================
// Documentos
// =====================
export interface Documento {
  id: string
  paciente_id: string
  visita_id: string | null
  terapeuta_id: string
  tipo: TipoDocumento | null
  nombre: string
  archivo_url: string
  fecha_documento: string | null
  notas: string | null
  interpretacion_clinica: string | null
  created_at: string
}
