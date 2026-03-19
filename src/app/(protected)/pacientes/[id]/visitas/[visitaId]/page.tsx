'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Paciente,
  Visita,
  Anamnesis,
  ExploracionLengua,
  ExploracionPulso,
  ExploracionObservacion,
  SintesisClinica,
  TratamientoSesion,
  ProtocoloSeguimiento,
} from '@/types'
import Link from 'next/link'
import { ArrowLeft, Check, FileText } from 'lucide-react'
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
  const router = useRouter()
  const [tab, setTab] = useState<TabId>('anamnesis')
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [visita, setVisita] = useState<Visita | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()
  const pacienteId = params.id as string
  const visitaId = params.visitaId as string

  useEffect(() => {
    cargarDatos()
  }, [pacienteId, visitaId])

  async function cargarDatos() {
    setLoading(true)
    const [pacienteRes, visitaRes] = await Promise.all([
      supabase.from('pacientes').select('*').eq('id', pacienteId).single(),
      supabase.from('visitas').select('*').eq('id', visitaId).single(),
    ])

    if (pacienteRes.data) setPaciente(pacienteRes.data)
    if (visitaRes.data) setVisita(visitaRes.data)
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
    <div className="max-w-5xl space-y-4">
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
              Visita #{visita.numero_visita} — {paciente.nombre} {paciente.apellidos}
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
              Completar visita
            </button>
          )}
        </div>
      </div>

      {/* Info rápida del paciente */}
      {paciente.alertas && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm text-amber-800">
          ⚠ {paciente.alertas}
        </div>
      )}

      {/* Pestañas del Modo Consulta */}
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

      {/* Contenido del módulo activo */}
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
  )
}
