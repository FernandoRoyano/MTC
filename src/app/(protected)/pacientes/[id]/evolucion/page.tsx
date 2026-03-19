'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Paciente } from '@/types'
import Link from 'next/link'
import { ArrowLeft, TrendingUp } from 'lucide-react'

interface VisitaResumen {
  id: string
  fecha: string
  numero_visita: number
  estado: string
  motivo_visita: string | null
  anamnesis: { energia: string | null; sueno: string | null; digestivo: string | null; estado_emocional: string | null } | null
  sintesis_clinica: { diagnostico_energetico: string | null; patrones_sindromes: string[]; objetivos_tratamiento: string | null } | null
  tratamiento_sesion: { puntos_acupuntura: string[]; moxa: boolean; tuina: boolean; ventosas: boolean } | null
}

export default function EvolucionPage() {
  const params = useParams()
  const pacienteId = params.id as string
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [visitas, setVisitas] = useState<VisitaResumen[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    cargar()
  }, [pacienteId])

  async function cargar() {
    setLoading(true)
    const [pacRes, visitasRes] = await Promise.all([
      supabase.from('pacientes').select('*').eq('id', pacienteId).single(),
      supabase
        .from('visitas')
        .select(`
          id, fecha, numero_visita, estado, motivo_visita,
          anamnesis(energia, sueno, digestivo, estado_emocional),
          sintesis_clinica(diagnostico_energetico, patrones_sindromes, objetivos_tratamiento),
          tratamiento_sesion(puntos_acupuntura, moxa, tuina, ventosas)
        `)
        .eq('paciente_id', pacienteId)
        .order('fecha', { ascending: true }),
    ])

    if (pacRes.data) setPaciente(pacRes.data)
    if (visitasRes.data) setVisitas(visitasRes.data as unknown as VisitaResumen[])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-salvia-500" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Cabecera */}
      <div className="flex items-center gap-4">
        <Link
          href={`/pacientes/${pacienteId}`}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-arena-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-salvia-500" />
            Evolución
          </h1>
          {paciente && (
            <p className="text-sm text-gray-500">
              {paciente.nombre} {paciente.apellidos} — {visitas.length} visitas
            </p>
          )}
        </div>
      </div>

      {visitas.length === 0 ? (
        <div className="bg-white border border-arena-200 rounded-xl p-8 text-center">
          <p className="text-gray-400">No hay visitas registradas para mostrar evolución</p>
        </div>
      ) : (
        <>
          {/* Timeline de visitas */}
          <div className="relative">
            {/* Línea vertical */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-arena-200" />

            <div className="space-y-6">
              {visitas.map((v, _index) => {
                const anamnesis = v.anamnesis
                const sintesis = v.sintesis_clinica
                const tratamiento = v.tratamiento_sesion
                const tecnicas = [
                  tratamiento?.moxa && 'Moxa',
                  tratamiento?.tuina && 'Tuina',
                  tratamiento?.ventosas && 'Ventosas',
                ].filter(Boolean)

                return (
                  <div key={v.id} className="relative pl-14">
                    {/* Punto en timeline */}
                    <div
                      className={`absolute left-4 w-5 h-5 rounded-full border-2 ${
                        v.estado === 'completada'
                          ? 'bg-salvia-500 border-salvia-500'
                          : 'bg-white border-amber-400'
                      }`}
                    />

                    <Link
                      href={`/pacientes/${pacienteId}/visitas/${v.id}`}
                      className="block bg-white border border-arena-200 rounded-xl p-5 hover:border-salvia-300 transition-colors"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-salvia-100 text-salvia-700 px-2 py-0.5 rounded-full font-medium">
                            #{v.numero_visita}
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            {new Date(v.fecha).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            v.estado === 'completada'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {v.estado === 'completada' ? 'Completada' : 'Borrador'}
                        </span>
                      </div>

                      {/* Motivo */}
                      {v.motivo_visita && (
                        <p className="text-sm text-gray-600 mb-3">{v.motivo_visita}</p>
                      )}

                      {/* Datos de anamnesis */}
                      {anamnesis && (
                        <div className="flex flex-wrap gap-3 mb-3">
                          {anamnesis.energia && (
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                              Energía: {anamnesis.energia}
                            </span>
                          )}
                          {anamnesis.sueno && (
                            <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded">
                              Sueño: {anamnesis.sueno}
                            </span>
                          )}
                          {anamnesis.digestivo && (
                            <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded">
                              Digestivo: {anamnesis.digestivo}
                            </span>
                          )}
                          {anamnesis.estado_emocional && (
                            <span className="text-xs bg-pink-50 text-pink-600 px-2 py-1 rounded">
                              Emocional: {anamnesis.estado_emocional}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Diagnóstico y patrones */}
                      {sintesis && (
                        <div className="mb-3">
                          {sintesis.diagnostico_energetico && (
                            <p className="text-xs text-gray-700 mb-1">
                              <span className="font-medium text-terracota-600">Dx:</span>{' '}
                              {sintesis.diagnostico_energetico}
                            </p>
                          )}
                          {sintesis.patrones_sindromes && sintesis.patrones_sindromes.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {sintesis.patrones_sindromes.map((p, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-terracota-50 text-terracota-700 px-2 py-0.5 rounded-full"
                                >
                                  {p}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tratamiento */}
                      {tratamiento && (tratamiento.puntos_acupuntura?.length > 0 || tecnicas.length > 0) && (
                        <div className="flex flex-wrap gap-1.5">
                          {tratamiento.puntos_acupuntura?.map((punto) => (
                            <span
                              key={punto}
                              className="text-xs bg-salvia-50 text-salvia-700 px-1.5 py-0.5 rounded"
                            >
                              {punto}
                            </span>
                          ))}
                          {tecnicas.map((t) => (
                            <span
                              key={t as string}
                              className="text-xs bg-arena-100 text-gray-600 px-1.5 py-0.5 rounded"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
