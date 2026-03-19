'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plantilla } from '@/types'
import { Save, Check, Copy, ClipboardCheck } from 'lucide-react'

interface Props {
  visitaId: string
  pacienteId: string
  pacienteNombre: string
}

const CAMPOS = [
  { key: 'alimentacion', label: 'Alimentación' },
  { key: 'habitos_vida', label: 'Hábitos de vida' },
  { key: 'exposicion_solar', label: 'Exposición solar' },
  { key: 'descanso', label: 'Descanso' },
  { key: 'deporte_movimiento', label: 'Deporte / Movimiento' },
  { key: 'respiraciones', label: 'Respiraciones' },
  { key: 'practicas_regulacion', label: 'Prácticas de regulación' },
  { key: 'aceites_esenciales', label: 'Aceites esenciales' },
  { key: 'suplementos', label: 'Suplementos' },
  { key: 'fitoterapia_china', label: 'Fitoterapia china' },
  { key: 'otras_recomendaciones', label: 'Otras recomendaciones' },
  { key: 'notas_adicionales', label: 'Notas adicionales' },
] as const

export default function ProtocoloForm({ visitaId, pacienteId, pacienteNombre }: Props) {
  const [form, setForm] = useState<Record<string, string>>({})
  const [existingId, setExistingId] = useState<string | null>(null)
  const [plantillas, setPlantillas] = useState<Plantilla[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    cargar()
  }, [visitaId])

  async function cargar() {
    setLoading(true)

    const [protocoloRes, plantillasRes] = await Promise.all([
      supabase.from('protocolo_seguimiento').select('*').eq('visita_id', visitaId).maybeSingle(),
      supabase.from('plantillas').select('*').eq('activa', true).order('nombre'),
    ])

    if (protocoloRes.data) {
      setExistingId(protocoloRes.data.id)
      const values: Record<string, string> = {}
      CAMPOS.forEach(({ key }) => {
        values[key] = protocoloRes.data[key] || ''
      })
      setForm(values)
    }
    if (plantillasRes.data) setPlantillas(plantillasRes.data)

    setLoading(false)
  }

  async function guardar() {
    setSaving(true)
    setSaved(false)

    const payload = {
      visita_id: visitaId,
      paciente_id: pacienteId,
      ...form,
    }

    if (existingId) {
      await supabase.from('protocolo_seguimiento').update(payload).eq('id', existingId)
    } else {
      const { data } = await supabase.from('protocolo_seguimiento').insert(payload).select().single()
      if (data) setExistingId(data.id)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function cargarPlantilla(plantilla: Plantilla) {
    const contenido = plantilla.contenido as Record<string, string>
    const updated = { ...form }
    Object.keys(contenido).forEach((key) => {
      if (contenido[key] && CAMPOS.some((c) => c.key === key)) {
        updated[key] = contenido[key]
      }
    })
    setForm(updated)
  }

  function generarTextoWhatsApp(): string {
    let texto = `Hola ${pacienteNombre} 🌿\n\nAquí tienes tu protocolo tras la sesión de hoy:\n`

    const secciones = [
      { key: 'alimentacion', emoji: '🥗', label: 'Alimentación' },
      { key: 'habitos_vida', emoji: '🌙', label: 'Hábitos de vida' },
      { key: 'exposicion_solar', emoji: '☀️', label: 'Exposición solar' },
      { key: 'descanso', emoji: '😴', label: 'Descanso' },
      { key: 'deporte_movimiento', emoji: '🏃', label: 'Deporte / Movimiento' },
      { key: 'respiraciones', emoji: '🌬️', label: 'Respiraciones' },
      { key: 'practicas_regulacion', emoji: '🧘', label: 'Prácticas de regulación' },
      { key: 'aceites_esenciales', emoji: '🫧', label: 'Aceites esenciales' },
      { key: 'suplementos', emoji: '💊', label: 'Suplementos' },
      { key: 'fitoterapia_china', emoji: '🌿', label: 'Fitoterapia china' },
      { key: 'otras_recomendaciones', emoji: '📝', label: 'Otras recomendaciones' },
    ]

    secciones.forEach(({ key, emoji, label }) => {
      if (form[key]?.trim()) {
        texto += `\n${emoji} *${label}*\n${form[key].trim()}\n`
      }
    })

    if (form.notas_adicionales?.trim()) {
      texto += `\n💬 *Notas adicionales*\n${form.notas_adicionales.trim()}\n`
    }

    texto += '\nCualquier duda me dices. ¡Hasta la próxima! 💚'
    return texto
  }

  async function copiarWhatsApp() {
    const texto = generarTextoWhatsApp()
    await navigator.clipboard.writeText(texto)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return <div className="animate-pulse h-32 bg-arena-50 rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-800">Protocolo de Seguimiento</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={copiarWhatsApp}
            className="flex items-center gap-2 border border-green-300 text-green-700 hover:bg-green-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {copied ? <ClipboardCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado' : 'Copiar WhatsApp'}
          </button>
          <button
            onClick={guardar}
            disabled={saving}
            className="flex items-center gap-2 bg-salvia-500 hover:bg-salvia-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Selector de plantilla */}
      {plantillas.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Cargar desde plantilla
          </label>
          <div className="flex flex-wrap gap-2">
            {plantillas.map((p) => (
              <button
                key={p.id}
                onClick={() => cargarPlantilla(p)}
                className="px-3 py-1.5 text-xs border border-arena-200 rounded-lg text-gray-600 hover:bg-salvia-50 hover:border-salvia-300 transition-colors"
              >
                {p.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Campos del protocolo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CAMPOS.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <textarea
              value={form[key] || ''}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm resize-none"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
