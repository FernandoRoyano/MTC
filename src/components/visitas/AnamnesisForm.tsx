'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Anamnesis } from '@/types'
import { Save, Check } from 'lucide-react'

interface Props {
  visitaId: string
}

const CAMPOS = [
  { key: 'motivo_consulta', label: 'Motivo de consulta', rows: 2 },
  { key: 'sintomas_principales', label: 'Síntomas principales', rows: 3 },
  { key: 'evolucion', label: 'Evolución desde la última visita', rows: 2 },
  { key: 'antecedentes', label: 'Antecedentes relevantes', rows: 2 },
  { key: 'digestivo', label: 'Digestivo', rows: 2 },
  { key: 'sueno', label: 'Sueño', rows: 2 },
  { key: 'energia', label: 'Energía', rows: 2 },
  { key: 'estado_emocional', label: 'Estado emocional', rows: 2 },
  { key: 'habitos', label: 'Hábitos', rows: 2 },
  { key: 'ejercicio', label: 'Ejercicio', rows: 2 },
  { key: 'alimentacion', label: 'Alimentación', rows: 2 },
  { key: 'menstruacion', label: 'Menstruación', rows: 2 },
  { key: 'observaciones_libres', label: 'Observaciones libres', rows: 3 },
] as const

export default function AnamnesisForm({ visitaId }: Props) {
  const [form, setForm] = useState<Record<string, string>>({})
  const [existingId, setExistingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    cargar()
  }, [visitaId])

  async function cargar() {
    setLoading(true)
    const { data } = await supabase
      .from('anamnesis')
      .select('*')
      .eq('visita_id', visitaId)
      .maybeSingle()

    if (data) {
      setExistingId(data.id)
      const values: Record<string, string> = {}
      CAMPOS.forEach(({ key }) => {
        values[key] = (data as Record<string, unknown>)[key] as string || ''
      })
      setForm(values)
    }
    setLoading(false)
  }

  async function guardar() {
    setSaving(true)
    setSaved(false)

    const payload = {
      visita_id: visitaId,
      ...form,
    }

    if (existingId) {
      await supabase.from('anamnesis').update(payload).eq('id', existingId)
    } else {
      const { data } = await supabase.from('anamnesis').insert(payload).select().single()
      if (data) setExistingId(data.id)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) {
    return <div className="animate-pulse h-32 bg-arena-50 rounded-lg" />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-800">Anamnesis</h3>
        <button
          onClick={guardar}
          disabled={saving}
          className="flex items-center gap-2 bg-salvia-500 hover:bg-salvia-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CAMPOS.map(({ key, label, rows }) => (
          <div key={key} className={rows >= 3 ? 'md:col-span-2' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            <textarea
              value={form[key] || ''}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              rows={rows}
              className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm resize-none"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
