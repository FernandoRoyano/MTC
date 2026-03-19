'use client'

import { useState } from 'react'
import {
  BookOpen,
  Users,
  ClipboardList,
  Stethoscope,
  FileText,
  TrendingUp,
  Layout,
  ChevronDown,
  ChevronRight,
  LogIn,
  Plus,
  Upload,
  Eye,
  Leaf,
} from 'lucide-react'

interface SeccionGuia {
  id: string
  titulo: string
  icon: React.ElementType
  color: string
  pasos: {
    titulo: string
    descripcion: string
  }[]
}

const GUIA: SeccionGuia[] = [
  {
    id: 'inicio',
    titulo: 'Primeros pasos',
    icon: LogIn,
    color: 'text-salvia-600 bg-salvia-50',
    pasos: [
      {
        titulo: 'Iniciar sesión',
        descripcion:
          'Accede a la aplicación con tu email y contraseña. Si es la primera vez, tu administrador debe crear tu cuenta desde el panel de Supabase (Authentication > Users > Add user).',
      },
      {
        titulo: 'Navegar por la app',
        descripcion:
          'Usa el menú lateral (sidebar) para moverte entre las secciones: Dashboard, Pacientes, Plantillas, Configuración y esta Guía.',
      },
      {
        titulo: 'Dashboard',
        descripcion:
          'Es tu página de inicio. Verás un resumen con el número de pacientes, visitas en borrador pendientes de completar y estadísticas generales.',
      },
    ],
  },
  {
    id: 'pacientes',
    titulo: 'Gestión de pacientes',
    icon: Users,
    color: 'text-blue-600 bg-blue-50',
    pasos: [
      {
        titulo: 'Crear un paciente',
        descripcion:
          'Ve a Pacientes > "Nuevo paciente". Rellena los datos básicos (nombre y apellidos son obligatorios). Puedes añadir teléfono, email, fecha de nacimiento, sexo, dirección, ocupación y motivo principal de consulta.',
      },
      {
        titulo: 'Buscar pacientes',
        descripcion:
          'En la lista de pacientes, usa el buscador para filtrar por nombre, teléfono o email. También puedes filtrar por estado: Activos, Inactivos o Alta.',
      },
      {
        titulo: 'Editar datos del paciente',
        descripcion:
          'Entra en la ficha del paciente y pulsa el botón "Editar". Podrás modificar todos sus datos, incluidas las etiquetas (separadas por comas), alertas y observaciones generales. Pulsa "Guardar" para confirmar.',
      },
      {
        titulo: 'Eliminar un paciente',
        descripcion:
          'En la ficha del paciente, pulsa "Eliminar paciente". Se te pedirá confirmación. ATENCIÓN: esto borra el paciente y todas sus visitas, documentos y datos clínicos asociados.',
      },
      {
        titulo: 'Estados del paciente',
        descripcion:
          'Cada paciente puede tener uno de tres estados: "Activo" (en tratamiento), "Inactivo" (pausado) o "Alta" (tratamiento finalizado). Puedes cambiarlo desde la edición de la ficha.',
      },
    ],
  },
  {
    id: 'visitas',
    titulo: 'Visitas y Modo Consulta',
    icon: ClipboardList,
    color: 'text-amber-600 bg-amber-50',
    pasos: [
      {
        titulo: 'Crear una visita',
        descripcion:
          'Desde la ficha del paciente, pulsa "Nueva visita". Se creará automáticamente con el número correlativo (Visita #1, #2, #3...) y estado "Borrador".',
      },
      {
        titulo: 'Modo Consulta',
        descripcion:
          'Al entrar en una visita accedes al Modo Consulta. Es una vista con 5 pestañas que siguen el flujo natural de la consulta: Anamnesis → Exploración → Síntesis → Tratamiento → Protocolo.',
      },
      {
        titulo: 'Panel lateral del paciente',
        descripcion:
          'A la izquierda verás un panel con los datos del paciente (edad, teléfono, email, motivo principal, alertas) y sus últimos documentos. Puedes plegarlo con el botón de flecha para tener más espacio.',
      },
      {
        titulo: 'Guardar datos',
        descripcion:
          'Cada pestaña tiene su propio botón "Guardar". Los datos se guardan de forma independiente por módulo. Si sales sin guardar, se perderán los cambios no guardados de esa pestaña.',
      },
      {
        titulo: 'Completar una visita',
        descripcion:
          'Cuando termines la consulta, pulsa "Completar" en la cabecera. El estado cambiará de "Borrador" a "Completada". Puedes seguir editando los datos después de completarla.',
      },
    ],
  },
  {
    id: 'anamnesis',
    titulo: 'Pestaña: Anamnesis',
    icon: Stethoscope,
    color: 'text-purple-600 bg-purple-50',
    pasos: [
      {
        titulo: 'Qué registrar',
        descripcion:
          'Aquí registras el motivo de la consulta, los síntomas principales y su evolución. También los antecedentes del paciente.',
      },
      {
        titulo: 'Cuestionario por sistemas',
        descripcion:
          'Completa los campos de: digestivo, sueño, energía, estado emocional, hábitos, ejercicio, alimentación y menstruación (si aplica). Son campos de texto libre donde puedes escribir con el detalle que necesites.',
      },
      {
        titulo: 'Observaciones libres',
        descripcion:
          'Usa este campo para cualquier nota adicional que no encaje en los campos anteriores.',
      },
    ],
  },
  {
    id: 'exploracion',
    titulo: 'Pestaña: Exploración MTC',
    icon: Eye,
    color: 'text-teal-600 bg-teal-50',
    pasos: [
      {
        titulo: 'Exploración de Lengua',
        descripcion:
          'Sube una foto de la lengua (JPG, PNG) pulsando "Subir foto de lengua". Se almacena de forma segura. Puedes eliminarla y subir otra. Completa: color del cuerpo, forma, saburra, humedad, marcas y notas libres.',
      },
      {
        titulo: 'Exploración del Pulso',
        descripcion:
          'Registra el pulso en las 6 posiciones (Izq/Dcha: Cun, Guan, Chi). Selecciona las cualidades del pulso tocando los tags (tenso, blando, resbaladizo, fino, etc.). Puedes registrar hasta 3 momentos: Inicio, Durante y Final de la sesión.',
      },
      {
        titulo: 'Añadir más registros de pulso',
        descripcion:
          'Pulsa "Añadir registro de pulso" para registrar el pulso en otro momento de la sesión. Puedes eliminar registros individuales.',
      },
      {
        titulo: 'Observación general',
        descripcion:
          'Registra la constitución, voz, piel, ojos, abdomen, signos físicos y otras observaciones que completen la exploración.',
      },
    ],
  },
  {
    id: 'sintesis',
    titulo: 'Pestaña: Síntesis Clínica',
    icon: Leaf,
    color: 'text-terracota-600 bg-terracota-50',
    pasos: [
      {
        titulo: 'Capa 1: Datos',
        descripcion:
          'Escribe un resumen de los datos relevantes recogidos en la anamnesis y la exploración.',
      },
      {
        titulo: 'Capa 2: Interpretación',
        descripcion:
          'Registra el diagnóstico energético y los patrones/síndromes (se añaden como tags: escribe y pulsa Enter o el botón "+"). También puedes anotar el terreno y la hipótesis clínica.',
      },
      {
        titulo: 'Capa 3: Intervención',
        descripcion:
          'Define las prioridades terapéuticas, la relación integrativa, la evolución respecto a la visita anterior y los objetivos del tratamiento.',
      },
    ],
  },
  {
    id: 'tratamiento',
    titulo: 'Pestaña: Tratamiento',
    icon: Plus,
    color: 'text-green-600 bg-green-50',
    pasos: [
      {
        titulo: 'Puntos de acupuntura',
        descripcion:
          'Añade los puntos utilizados como tags: escribe el nombre del punto y pulsa Enter o "+". Se muestran como etiquetas que puedes eliminar individualmente.',
      },
      {
        titulo: 'Técnicas complementarias',
        descripcion:
          'Activa Moxa, Tuina o Ventosas con el toggle correspondiente. Al activarlas, aparece un campo de notas para detallar la aplicación.',
      },
      {
        titulo: 'Aceites esenciales',
        descripcion:
          'Añade los aceites utilizados como tags, igual que los puntos de acupuntura.',
      },
      {
        titulo: 'Respuesta del paciente',
        descripcion:
          'Registra cómo respondió el paciente durante y después del tratamiento. Esto es muy útil para la evolución entre visitas.',
      },
    ],
  },
  {
    id: 'protocolo',
    titulo: 'Pestaña: Protocolo de Seguimiento',
    icon: FileText,
    color: 'text-indigo-600 bg-indigo-50',
    pasos: [
      {
        titulo: 'Campos del protocolo',
        descripcion:
          'Completa las recomendaciones por área: alimentación, hábitos de vida, exposición solar, descanso, deporte/movimiento, respiraciones, prácticas de regulación, aceites esenciales, suplementos, fitoterapia china y otras recomendaciones.',
      },
      {
        titulo: 'Cargar desde plantilla',
        descripcion:
          'Si tienes plantillas creadas, selecciona una del desplegable y pulsa "Cargar". Los campos se rellenarán automáticamente. Puedes modificarlos después.',
      },
      {
        titulo: 'Copiar para WhatsApp',
        descripcion:
          'Pulsa el botón "Copiar para WhatsApp" para copiar el protocolo formateado al portapapeles. Luego pégalo directamente en WhatsApp para enviárselo al paciente.',
      },
    ],
  },
  {
    id: 'documentos',
    titulo: 'Documentos del paciente',
    icon: Upload,
    color: 'text-cyan-600 bg-cyan-50',
    pasos: [
      {
        titulo: 'Subir un documento',
        descripcion:
          'Desde la ficha del paciente, ve a "Documentos". Pulsa "Subir documento", selecciona el archivo (PDF, JPG, PNG, WEBP), ponle un nombre, selecciona el tipo (analítica, informe, imagen, cuestionario u otro), la fecha y opcionalmente la visita asociada.',
      },
      {
        titulo: 'Filtrar documentos',
        descripcion:
          'Usa el filtro por tipo para encontrar rápidamente analíticas, informes o imágenes.',
      },
      {
        titulo: 'Preview y descarga',
        descripcion:
          'Los documentos de tipo imagen se pueden previsualizar en un modal. Todos los documentos se pueden descargar pulsando el icono de descarga.',
      },
      {
        titulo: 'Eliminar documentos',
        descripcion:
          'Pulsa el icono de papelera y confirma. Se eliminará tanto el archivo del almacenamiento como el registro en la base de datos.',
      },
    ],
  },
  {
    id: 'evolucion',
    titulo: 'Evolución del paciente',
    icon: TrendingUp,
    color: 'text-pink-600 bg-pink-50',
    pasos: [
      {
        titulo: 'Acceder a la evolución',
        descripcion:
          'Desde la ficha del paciente, pulsa "Ver evolución". Verás un timeline visual con todas las visitas ordenadas cronológicamente.',
      },
      {
        titulo: 'Qué muestra cada visita',
        descripcion:
          'Para cada visita verás: número y fecha, estado de ánimo/energía/sueño/digestivo (de la anamnesis), diagnóstico energético y patrones (de la síntesis), puntos y técnicas aplicadas (del tratamiento).',
      },
      {
        titulo: 'Navegar entre visitas',
        descripcion:
          'Haz clic en cualquier visita del timeline para entrar en su Modo Consulta y ver o editar los datos completos.',
      },
    ],
  },
  {
    id: 'plantillas',
    titulo: 'Plantillas reutilizables',
    icon: Layout,
    color: 'text-orange-600 bg-orange-50',
    pasos: [
      {
        titulo: 'Crear una plantilla',
        descripcion:
          'Ve a Plantillas > "Nueva plantilla". Dale un nombre, categoría y descripción. Rellena los campos del protocolo que quieras reutilizar.',
      },
      {
        titulo: 'Usar una plantilla en una visita',
        descripcion:
          'En la pestaña Protocolo de cualquier visita, selecciona la plantilla del desplegable y pulsa "Cargar". Los campos se autorellenan y puedes personalizarlos para ese paciente.',
      },
      {
        titulo: 'Editar y eliminar plantillas',
        descripcion:
          'Desde la lista de plantillas puedes editar o eliminar cualquiera. Los protocolos que ya usaron esa plantilla no se ven afectados.',
      },
    ],
  },
]

export default function GuiaPage() {
  const [abierta, setAbierta] = useState<string | null>('inicio')

  function toggleSeccion(id: string) {
    setAbierta(abierta === id ? null : id)
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-salvia-100 rounded-full flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-salvia-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Guía de uso</h1>
          <p className="text-sm text-gray-500">
            Aprende a usar EstiloPat paso a paso
          </p>
        </div>
      </div>

      <div className="bg-salvia-50 border border-salvia-200 rounded-xl p-4">
        <p className="text-sm text-salvia-800">
          <strong>Flujo recomendado:</strong> Crear paciente → Crear visita → Rellenar Anamnesis → Exploración (lengua, pulso, observación) → Síntesis clínica → Tratamiento → Protocolo de seguimiento → Completar visita.
        </p>
      </div>

      <div className="space-y-2">
        {GUIA.map((seccion) => {
          const Icon = seccion.icon
          const isOpen = abierta === seccion.id

          return (
            <div
              key={seccion.id}
              className="bg-white border border-arena-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleSeccion(seccion.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-arena-50 transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${seccion.color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="flex-1 font-medium text-gray-800">
                  {seccion.titulo}
                </span>
                <span className="text-xs text-gray-400 mr-2">
                  {seccion.pasos.length} pasos
                </span>
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-3">
                  {seccion.pasos.map((paso, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-6 h-6 bg-arena-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-gray-500">
                          {i + 1}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {paso.titulo}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {paso.descripcion}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
