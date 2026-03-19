// Tipos principales de la aplicación MTC Acupuntura

export interface Paciente {
  id: string
  user_id: string
  nombre: string
  apellidos: string | null
  telefono: string | null
  email: string | null
  fecha_nacimiento: string | null
  motivo_consulta: string | null
  notas_generales: string | null
  created_at: string
}

export interface Anamnesis {
  id: string
  paciente_id: string
  fecha: string

  // Datos MTC - Pulso
  pulso_posicion_1: string | null  // Cun
  pulso_posicion_2: string | null  // Guan
  pulso_posicion_3: string | null  // Chi
  pulso_descripcion: string | null

  // Datos MTC - Lengua
  lengua_cuerpo: string | null
  lengua_saburra: string | null
  lengua_forma: string | null
  lengua_humedad: string | null
  lengua_notas: string | null

  // Cuestionario general
  sueno: string | null
  digestion: string | null
  energia: string | null
  dolor: string | null
  emociones: string | null
  ciclo_menstrual: string | null
  otros: string | null

  created_at: string
}

export interface Cita {
  id: string
  paciente_id: string
  fecha_hora: string
  duracion_minutos: number
  estado: 'pendiente' | 'completada' | 'cancelada'
  notas: string | null
  created_at: string
  // Relación
  paciente?: Paciente
}

export interface Sesion {
  id: string
  cita_id: string | null
  paciente_id: string
  fecha: string

  // Planificación del tratamiento
  tratamiento_tipo: string[]
  puntos_acupuntura: string | null
  aceites_usados: string | null

  // Timer
  timer_inicio: string | null
  timer_duracion_minutos: number

  // Pulso durante sesión
  pulso_inicio: string | null
  pulso_medio: string | null
  pulso_final: string | null

  // Notas
  notas_sesion: string | null

  // Estado
  estado: 'en_curso' | 'completada'

  created_at: string
  // Relaciones
  paciente?: Paciente
}

export interface Protocolo {
  id: string
  sesion_id: string | null
  paciente_id: string

  recomendaciones_alimentacion: string | null
  recomendaciones_habitos: string | null
  ejercicios: string | null
  suplementos: string | null
  notas_adicionales: string | null

  plantilla_id: string | null

  created_at: string
}

export interface Plantilla {
  id: string
  user_id: string
  nombre: string
  descripcion: string | null
  contenido_alimentacion: string | null
  contenido_habitos: string | null
  contenido_ejercicios: string | null
  contenido_suplementos: string | null
  created_at: string
}

export interface Archivo {
  id: string
  paciente_id: string
  nombre: string
  tipo: 'analitica' | 'informe' | 'foto' | 'otro'
  url: string
  notas: string | null
  fecha: string | null
  created_at: string
}
