'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Paciente, Visita, Documento } from '@/types'
import Link from 'next/link'
import {
  ArrowLeft,
  Check,
  Phone,
  Mail,
  AlertTriangle,
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react'
import AnamnesisForm from '@/components/visitas/AnamnesisForm'
import ExploracionForm from '@/components/visitas/ExploracionForm'
import SintesisForm from '@/components/visitas/SintesisForm'
import TratamientoForm from '@/components/visitas/TratamientoForm'
import ProtocoloForm from '@/components/visitas/ProtocoloForm'

const TABS = [
  { id: 'anamnesis', label: 'Anamnesis' },
  { id: 'exploracion', label: 'Exploración' },
  { id: 'sintesis', label: 'Síntesis' },
  { id: 'tratamiento', label: 'Tratamiento' },
  { id: 'protocolo', label: 'Protocolo' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function VisitaPage() {
  const params = useParams()
  const [tab, setTab] = useState<TabId>('anamnesis')
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [visita, setVisita] = useState<Visita | null>(null)
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [visitasCount, setVisitasCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [panelOpen, setPanelOpen] = useState(true)

  const supabase = createClient()
  const pacienteId = params.id as string
  const visitaId = params.visitaId as string

  useEffect(() => {
    cargarDatos()
  }, [pacienteId, visitaId])

  async function cargarDatos() {
    setLoading(true)
    const [pacienteRes, visitaRes, docsRes, visitasCountRes] = await Promise.all([
      supabase.from('pacientes').select('*').eq('id', pacienteId).single(),
      supabase.from('visitas').select('*').eq('id', visitaId).single(),
      supabase
        .from('documentos')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('visitas')
        .select('id', { count: 'exact', head: true })
        .eq('paciente_id', pacienteId),
    ])

    if (pacienteRes.data) setPaciente(pacienteRes.data)
    if (visitaRes.data) setVisita(visitaRes.data)
    if (docsRes.data) setDocumentos(docsRes.data)
    setVisitasCount(visitasCountRes.count || 0)
    setLoading(false)
  }

  async function completarVisita() {
    if (!visita) return
    const { error } = await supabase
      .from('visitas')
      .update({ estado: 'completada' })
      .eq('id', visita.id)

    if (!error) {
      setVisita({ ...visita, estado: 'completada' })
    }
  }

  async function descargarDoc(doc: Documento) {
    const { data } = await supabase.storage
      .from('documentos-pacientes')
      .createSignedUrl(doc.archivo_url, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  function calcularEdad(fecha: string): number {
    const hoy = new Date()
    const nac = new Date(fecha)
    let edad = hoy.getFullYear() - nac.getFullYear()
    const m = hoy.getMonth() - nac.getMonth()
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--
    return edad
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-salvia-500" />
      </div>
    )
  }

  if (!paciente || !visita) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Visita no encontrada</p>
      </div>
    )
  }

  return (
    <div className="flex gap-4 max-w-[1400px]">
      {/* PANEL LATERAL — Info del paciente */}
      {panelOpen && (
        <aside className="w-72 shrink-0 space-y-4">
          {/* Datos del paciente */}
          <div className="bg-white border border-arena-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Link
                href={`/pacientes/${pacienteId}`}
                className="text-sm font-semibold text-gray-800 hover:text-salvia-600 transition-colors"
              >
                {paciente.nombre} {paciente.apellidos}
              </Link>
              <button
                onClick={() => setPanelOpen(false)}
                className="p-1 rounded hover:bg-arena-50 text-gray-400"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-gray-600">
              {paciente.fecha_nacimiento && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-salvia-500" />
                  {calcularEdad(paciente.fecha_nacimiento)} años
                </div>
              )}
              {paciente.telefono && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-salvia-500" />
                  {paciente.telefono}
                </div>
              )}
              {paciente.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-salvia-500" />
                  {paciente.email}
                </div>
              )}
            </div>

            {paciente.motivo_principal && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">Motivo principal</p>
                <p className="text-xs text-gray-700 line-clamp-3">{paciente.motivo_principal}</p>
              </div>
            )}

            <div className="text-xs text-gray-400">
              {visitasCount} visitas totales
            </div>
          </div>

          {/* Alertas */}
          {paciente.alertas && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800">{paciente.alertas}</p>
            </div>
          )}

          {/* Documentos previos */}
          <div className="bg-white border border-arena-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-700">Documentos</h3>
              <Link
                href={`/pacientes/${pacienteId}/documentos`}
                className="text-xs text-salvia-600 hover:text-salvia-700"
              >
                Ver todos
              </Link>
            </div>
            {documentos.length === 0 ? (
              <p className="text-xs text-gray-400">Sin documentos</p>
            ) : (
              <div className="space-y-1.5">
                {documentos.slice(0, 5).map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => descargarDoc(doc)}
                    className="w-full flex items-center gap-2 text-left py-1.5 px-2 rounded-lg hover:bg-arena-50 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-700 truncate">{doc.nombre}</span>
                    <Download className="w-3 h-3 text-gray-300 shrink-0 ml-auto" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Botón para reabrir panel */}
      {!panelOpen && (
        <button
          onClick={() => setPanelOpen(true)}
          className="self-start mt-14 p-1.5 bg-white border border-arena-200 rounded-lg hover:bg-arena-50 transition-colors"
          title="Mostrar panel del paciente"
        >
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Cabecera */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/pacientes/${pacienteId}`}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-arena-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                Visita #{visita.numero_visita}
              </h1>
              <p className="text-sm text-gray-500">
                {new Date(visita.fecha).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-full ${
                visita.estado === 'completada'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {visita.estado === 'completada' ? 'Completada' : 'Borrador'}
            </span>
            {visita.estado === 'borrador' && (
              <button
                onClick={completarVisita}
                className="flex items-center gap-1.5 text-sm bg-salvia-500 hover:bg-salvia-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Check className="w-4 h-4" />
                Completar
              </button>
            )}
          </div>
        </div>

        {/* Pestañas */}
        <div className="border-b border-arena-200">
          <nav className="flex gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                  tab === t.id
                    ? 'bg-white border border-arena-200 border-b-white text-salvia-700 -mb-px'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-arena-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Módulo activo */}
        <div className="bg-white border border-arena-200 rounded-xl p-6">
          {tab === 'anamnesis' && <AnamnesisForm visitaId={visitaId} />}
          {tab === 'exploracion' && <ExploracionForm visitaId={visitaId} />}
          {tab === 'sintesis' && <SintesisForm visitaId={visitaId} />}
          {tab === 'tratamiento' && <TratamientoForm visitaId={visitaId} />}
          {tab === 'protocolo' && (
            <ProtocoloForm visitaId={visitaId} pacienteId={pacienteId} pacienteNombre={paciente.nombre} />
          )}
        </div>
      </div>
    </div>
  )
}
