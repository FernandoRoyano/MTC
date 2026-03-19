'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Check, Plus, Trash2 } from 'lucide-react'

interface Props {
  visitaId: string
}

// Posiciones del pulso
const POSICIONES_PULSO = [
  { key: 'izq_cun', label: 'Izq. Cun' },
  { key: 'izq_guan', label: 'Izq. Guan' },
  { key: 'izq_chi', label: 'Izq. Chi' },
  { key: 'dcha_cun', label: 'Dcha. Cun' },
  { key: 'dcha_guan', label: 'Dcha. Guan' },
  { key: 'dcha_chi', label: 'Dcha. Chi' },
] as const

const CUALIDADES_PULSO = [
  'tenso', 'blando', 'resbaladizo', 'rugoso', 'fino', 'amplio',
  'superficial', 'profundo', 'rápido', 'lento', 'débil', 'fuerte',
  'de cuerda', 'irregular',
]

// Campos de lengua
const CAMPOS_LENGUA = [
  { key: 'color_cuerpo', label: 'Color del cuerpo' },
  { key: 'forma', label: 'Forma' },
  { key: 'saburra', label: 'Saburra' },
  { key: 'humedad', label: 'Humedad' },
  { key: 'marcas', label: 'Marcas' },
]

// Campos de observación general
const CAMPOS_OBSERVACION = [
  { key: 'constitucion', label: 'Constitución' },
  { key: 'voz', label: 'Voz' },
  { key: 'piel', label: 'Piel' },
  { key: 'ojos', label: 'Ojos' },
  { key: 'abdomen', label: 'Abdomen' },
  { key: 'signos_fisicos', label: 'Signos físicos' },
  { key: 'otras_observaciones', label: 'Otras observaciones' },
]

export default function ExploracionForm({ visitaId }: Props) {
  // Lengua
  const [lengua, setLengua] = useState<Record<string, string>>({})
  const [lenguaId, setLenguaId] = useState<string | null>(null)

  // Pulso (puede haber múltiples: inicio, durante, final)
  const [pulsos, setPulsos] = useState<Array<{ id?: string; momento: string; datos: Record<string, string>; cualidades: string[] }>>([])

  // Observación
  const [observacion, setObservacion] = useState<Record<string, string>>({})
  const [observacionId, setObservacionId] = useState<string | null>(null)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [seccion, setSeccion] = useState<'lengua' | 'pulso' | 'observacion'>('lengua')

  const supabase = createClient()

  useEffect(() => {
    cargar()
  }, [visitaId])

  async function cargar() {
    setLoading(true)

    const [lenguaRes, pulsoRes, obsRes] = await Promise.all([
      supabase.from('exploracion_lengua').select('*').eq('visita_id', visitaId).maybeSingle(),
      supabase.from('exploracion_pulso').select('*').eq('visita_id', visitaId).order('created_at'),
      supabase.from('exploracion_observacion').select('*').eq('visita_id', visitaId).maybeSingle(),
    ])

    if (lenguaRes.data) {
      setLenguaId(lenguaRes.data.id)
      const values: Record<string, string> = {}
      CAMPOS_LENGUA.forEach(({ key }) => { values[key] = lenguaRes.data[key] || '' })
      values.notas_libres = lenguaRes.data.notas_libres || ''
      setLengua(values)
    }

    if (pulsoRes.data && pulsoRes.data.length > 0) {
      setPulsos(
        pulsoRes.data.map((p: Record<string, unknown>) => ({
          id: p.id as string,
          momento: (p.momento as string) || 'inicio',
          datos: POSICIONES_PULSO.reduce((acc, { key }) => {
            acc[key] = (p[key] as string) || ''
            return acc
          }, {} as Record<string, string>),
          cualidades: (p.cualidades as string[]) || [],
        }))
      )
    } else {
      setPulsos([{ momento: 'inicio', datos: {}, cualidades: [] }])
    }

    if (obsRes.data) {
      setObservacionId(obsRes.data.id)
      const values: Record<string, string> = {}
      CAMPOS_OBSERVACION.forEach(({ key }) => { values[key] = obsRes.data[key] || '' })
      setObservacion(values)
    }

    setLoading(false)
  }

  async function guardar() {
    setSaving(true)
    setSaved(false)

    // Guardar lengua
    const lenguaPayload = { visita_id: visitaId, ...lengua }
    if (lenguaId) {
      await supabase.from('exploracion_lengua').update(lenguaPayload).eq('id', lenguaId)
    } else {
      const { data } = await supabase.from('exploracion_lengua').insert(lenguaPayload).select().single()
      if (data) setLenguaId(data.id)
    }

    // Guardar pulsos
    for (const pulso of pulsos) {
      const pulsoPayload = {
        visita_id: visitaId,
        momento: pulso.momento,
        cualidades: pulso.cualidades,
        ...pulso.datos,
      }
      if (pulso.id) {
        await supabase.from('exploracion_pulso').update(pulsoPayload).eq('id', pulso.id)
      } else {
        const { data } = await supabase.from('exploracion_pulso').insert(pulsoPayload).select().single()
        if (data) pulso.id = data.id
      }
    }

    // Guardar observación
    const obsPayload = { visita_id: visitaId, ...observacion }
    if (observacionId) {
      await supabase.from('exploracion_observacion').update(obsPayload).eq('id', observacionId)
    } else {
      const { data } = await supabase.from('exploracion_observacion').insert(obsPayload).select().single()
      if (data) setObservacionId(data.id)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function addPulso() {
    const momentos = ['inicio', 'durante', 'final']
    const usados = pulsos.map((p) => p.momento)
    const siguiente = momentos.find((m) => !usados.includes(m)) || 'inicio'
    setPulsos([...pulsos, { momento: siguiente, datos: {}, cualidades: [] }])
  }

  function removePulso(index: number) {
    const pulso = pulsos[index]
    if (pulso.id) {
      supabase.from('exploracion_pulso').delete().eq('id', pulso.id).then()
    }
    setPulsos(pulsos.filter((_, i) => i !== index))
  }

  function toggleCualidad(index: number, cualidad: string) {
    const updated = [...pulsos]
    const p = updated[index]
    if (p.cualidades.includes(cualidad)) {
      p.cualidades = p.cualidades.filter((c) => c !== cualidad)
    } else {
      p.cualidades = [...p.cualidades, cualidad]
    }
    setPulsos(updated)
  }

  if (loading) {
    return <div className="animate-pulse h-32 bg-arena-50 rounded-lg" />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-800">Exploración MTC</h3>
        <button
          onClick={guardar}
          disabled={saving}
          className="flex items-center gap-2 bg-salvia-500 hover:bg-salvia-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar todo'}
        </button>
      </div>

      {/* Sub-pestañas */}
      <div className="flex gap-2">
        {(['lengua', 'pulso', 'observacion'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSeccion(s)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              seccion === s
                ? 'bg-salvia-100 text-salvia-700 font-medium'
                : 'text-gray-500 hover:bg-arena-50'
            }`}
          >
            {s === 'lengua' ? 'Lengua' : s === 'pulso' ? 'Pulso' : 'Observación'}
          </button>
        ))}
      </div>

      {/* LENGUA */}
      {seccion === 'lengua' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CAMPOS_LENGUA.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  value={lengua[key] || ''}
                  onChange={(e) => setLengua({ ...lengua, [key]: e.target.value })}
                  className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas libres</label>
            <textarea
              value={lengua.notas_libres || ''}
              onChange={(e) => setLengua({ ...lengua, notas_libres: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm resize-none"
            />
          </div>
        </div>
      )}

      {/* PULSO */}
      {seccion === 'pulso' && (
        <div className="space-y-6">
          {pulsos.map((pulso, index) => (
            <div key={index} className="border border-arena-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <select
                    value={pulso.momento}
                    onChange={(e) => {
                      const updated = [...pulsos]
                      updated[index].momento = e.target.value
                      setPulsos(updated)
                    }}
                    className="px-3 py-1.5 border border-arena-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-salvia-300"
                  >
                    <option value="inicio">Inicio</option>
                    <option value="durante">Durante</option>
                    <option value="final">Final</option>
                  </select>
                  <span className="text-sm text-gray-500">Pulso #{index + 1}</span>
                </div>
                {pulsos.length > 1 && (
                  <button
                    onClick={() => removePulso(index)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* 6 posiciones */}
              <div className="grid grid-cols-3 gap-3">
                {POSICIONES_PULSO.map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                    <input
                      value={pulso.datos[key] || ''}
                      onChange={(e) => {
                        const updated = [...pulsos]
                        updated[index].datos[key] = e.target.value
                        setPulsos(updated)
                      }}
                      className="w-full px-2 py-1.5 border border-arena-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-salvia-300"
                      placeholder={label}
                    />
                  </div>
                ))}
              </div>

              {/* Cualidades */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Cualidades</label>
                <div className="flex flex-wrap gap-1.5">
                  {CUALIDADES_PULSO.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCualidad(index, c)}
                      className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                        pulso.cualidades.includes(c)
                          ? 'bg-salvia-100 border-salvia-300 text-salvia-700'
                          : 'border-arena-200 text-gray-500 hover:bg-arena-50'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {pulsos.length < 3 && (
            <button
              onClick={addPulso}
              className="flex items-center gap-1.5 text-sm text-salvia-600 hover:text-salvia-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              Añadir registro de pulso
            </button>
          )}
        </div>
      )}

      {/* OBSERVACIÓN */}
      {seccion === 'observacion' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CAMPOS_OBSERVACION.map(({ key, label }) => (
            <div key={key} className={key === 'otras_observaciones' ? 'sm:col-span-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              {key === 'otras_observaciones' ? (
                <textarea
                  value={observacion[key] || ''}
                  onChange={(e) => setObservacion({ ...observacion, [key]: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm resize-none"
                />
              ) : (
                <input
                  value={observacion[key] || ''}
                  onChange={(e) => setObservacion({ ...observacion, [key]: e.target.value })}
                  className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
