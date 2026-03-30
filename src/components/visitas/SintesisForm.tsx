'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Check } from 'lucide-react'

interface Props {
  visitaId: string
}

export default function SintesisForm({ visitaId }: Props) {
  const [form, setForm] = useState<Record<string, string>>({})
  const [patrones, setPatrones] = useState<string[]>([])
  const [nuevoPatron, setNuevoPatron] = useState('')
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
      .from('sintesis_clinica')
      .select('*')
      .eq('visita_id', visitaId)
      .maybeSingle()

    if (data) {
      setExistingId(data.id)
      setForm({
        resumen_datos: data.resumen_datos || '',
        diagnostico_energetico: data.diagnostico_energetico || '',
        terreno: data.terreno || '',
        hipotesis_clinica: data.hipotesis_clinica || '',
        prioridades_terapeuticas: data.prioridades_terapeuticas || '',
        relacion_integrativa: data.relacion_integrativa || '',
        evolucion_respecto_anterior: data.evolucion_respecto_anterior || '',
        objetivos_tratamiento: data.objetivos_tratamiento || '',
      })
      setPatrones(data.patrones_sindromes || [])
    }
    setLoading(false)
  }

  async function guardar() {
    setSaving(true)
    setSaved(false)

    const payload = {
      visita_id: visitaId,
      ...form,
      patrones_sindromes: patrones,
    }

    if (existingId) {
      await supabase.from('sintesis_clinica').update(payload).eq('id', existingId)
    } else {
      const { data } = await supabase.from('sintesis_clinica').insert(payload).select().single()
      if (data) setExistingId(data.id)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function addPatron() {
    if (nuevoPatron.trim()) {
      setPatrones([...patrones, nuevoPatron.trim()])
      setNuevoPatron('')
    }
  }

  if (loading) {
    return <div className="animate-pulse h-32 bg-arena-50 rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-800">Síntesis Clínica</h3>
        <button
          onClick={guardar}
          disabled={saving}
          className="flex items-center gap-2 bg-salvia-500 hover:bg-salvia-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar'}
        </button>
      </div>

      {/* Capa A — Datos observados */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-salvia-700 uppercase tracking-wide">
          A — Datos observados
        </h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resumen integrado de datos
          </label>
          <textarea
            value={form.resumen_datos || ''}
            onChange={(e) => setForm({ ...form, resumen_datos: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm resize-none overflow-hidden"
              onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px' }}
              ref={(el) => { if (el && el.value) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' } }}
            placeholder="Integración de síntomas, lengua, pulso y analíticas..."
          />
        </div>
      </div>

      {/* Capa B — Interpretación */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-terracota-600 uppercase tracking-wide">
          B — Interpretación clínica
        </h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Diagnóstico energético
          </label>
          <textarea
            value={form.diagnostico_energetico || ''}
            onChange={(e) => setForm({ ...form, diagnostico_energetico: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm resize-none overflow-hidden"
              onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px' }}
              ref={(el) => { if (el && el.value) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' } }}
          />
        </div>

        {/* Patrones / síndromes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Patrones / Síndromes
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {patrones.map((p, i) => (
              <span
                key={i}
                className="flex items-center gap-1 bg-terracota-50 text-terracota-700 px-2.5 py-1 rounded-full text-xs"
              >
                {p}
                <button
                  onClick={() => setPatrones(patrones.filter((_, j) => j !== i))}
                  className="text-terracota-400 hover:text-terracota-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={nuevoPatron}
              onChange={(e) => setNuevoPatron(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPatron())}
              className="flex-1 px-3 py-1.5 border border-arena-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-salvia-300"
              placeholder="Ej: Estancamiento de Qi de Hígado"
            />
            <button
              onClick={addPatron}
              className="px-3 py-1.5 bg-arena-100 text-gray-600 rounded-lg text-sm hover:bg-arena-200 transition-colors"
            >
              Añadir
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Terreno</label>
            <textarea
              value={form.terreno || ''}
              onChange={(e) => setForm({ ...form, terreno: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm resize-none overflow-hidden"
              onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px' }}
              ref={(el) => { if (el && el.value) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' } }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hipótesis clínica</label>
            <textarea
              value={form.hipotesis_clinica || ''}
              onChange={(e) => setForm({ ...form, hipotesis_clinica: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm resize-none overflow-hidden"
              onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px' }}
              ref={(el) => { if (el && el.value) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' } }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prioridades terapéuticas</label>
          <textarea
            value={form.prioridades_terapeuticas || ''}
            onChange={(e) => setForm({ ...form, prioridades_terapeuticas: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm resize-none overflow-hidden"
              onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px' }}
              ref={(el) => { if (el && el.value) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' } }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Relación integrativa</label>
          <textarea
            value={form.relacion_integrativa || ''}
            onChange={(e) => setForm({ ...form, relacion_integrativa: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm resize-none overflow-hidden"
              onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px' }}
              ref={(el) => { if (el && el.value) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' } }}
            placeholder="Cómo se relacionan síntomas, lengua, pulso y analíticas..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Evolución respecto a anterior</label>
          <textarea
            value={form.evolucion_respecto_anterior || ''}
            onChange={(e) => setForm({ ...form, evolucion_respecto_anterior: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm resize-none overflow-hidden"
              onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px' }}
              ref={(el) => { if (el && el.value) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' } }}
          />
        </div>
      </div>

      {/* Capa C — Intervención */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
          C — Objetivos de tratamiento
        </h4>
        <textarea
          value={form.objetivos_tratamiento || ''}
          onChange={(e) => setForm({ ...form, objetivos_tratamiento: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm resize-none overflow-hidden"
              onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px' }}
              ref={(el) => { if (el && el.value) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' } }}
          placeholder="Objetivos para esta sesión y a medio plazo..."
        />
      </div>
    </div>
  )
}
