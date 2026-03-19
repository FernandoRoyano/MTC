'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Check, X } from 'lucide-react'

interface Props {
  visitaId: string
}

const PUNTOS_COMUNES = [
  'ST36', 'SP6', 'LV3', 'LI4', 'PC6', 'HT7', 'KI3', 'KI6',
  'BL23', 'BL20', 'BL18', 'GV20', 'CV4', 'CV6', 'CV12',
  'GB34', 'GB20', 'TE5', 'LU7', 'ST40',
]

export default function TratamientoForm({ visitaId }: Props) {
  const [existingId, setExistingId] = useState<string | null>(null)
  const [puntos, setPuntos] = useState<string[]>([])
  const [nuevoPunto, setNuevoPunto] = useState('')
  const [moxa, setMoxa] = useState(false)
  const [moxaNotas, setMoxaNotas] = useState('')
  const [tuina, setTuina] = useState(false)
  const [tuinaNotas, setTuinaNotas] = useState('')
  const [aceites, setAceites] = useState<string[]>([])
  const [nuevoAceite, setNuevoAceite] = useState('')
  const [ventosas, setVentosas] = useState(false)
  const [ventosasNotas, setVentosasNotas] = useState('')
  const [otrasTecnicas, setOtrasTecnicas] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [respuesta, setRespuesta] = useState('')
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
      .from('tratamiento_sesion')
      .select('*')
      .eq('visita_id', visitaId)
      .maybeSingle()

    if (data) {
      setExistingId(data.id)
      setPuntos(data.puntos_acupuntura || [])
      setMoxa(data.moxa || false)
      setMoxaNotas(data.moxa_notas || '')
      setTuina(data.tuina || false)
      setTuinaNotas(data.tuina_notas || '')
      setAceites(data.aceites_esenciales || [])
      setVentosas(data.ventosas || false)
      setVentosasNotas(data.ventosas_notas || '')
      setOtrasTecnicas(data.otras_tecnicas || '')
      setObservaciones(data.observaciones_tratamiento || '')
      setRespuesta(data.respuesta_paciente || '')
    }
    setLoading(false)
  }

  async function guardar() {
    setSaving(true)
    setSaved(false)

    const payload = {
      visita_id: visitaId,
      puntos_acupuntura: puntos,
      moxa,
      moxa_notas: moxaNotas || null,
      tuina,
      tuina_notas: tuinaNotas || null,
      aceites_esenciales: aceites,
      ventosas,
      ventosas_notas: ventosasNotas || null,
      otras_tecnicas: otrasTecnicas || null,
      observaciones_tratamiento: observaciones || null,
      respuesta_paciente: respuesta || null,
    }

    if (existingId) {
      await supabase.from('tratamiento_sesion').update(payload).eq('id', existingId)
    } else {
      const { data } = await supabase.from('tratamiento_sesion').insert(payload).select().single()
      if (data) setExistingId(data.id)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function addPunto(punto: string) {
    const p = punto.trim().toUpperCase()
    if (p && !puntos.includes(p)) {
      setPuntos([...puntos, p])
    }
    setNuevoPunto('')
  }

  function addAceite() {
    if (nuevoAceite.trim()) {
      setAceites([...aceites, nuevoAceite.trim()])
      setNuevoAceite('')
    }
  }

  if (loading) {
    return <div className="animate-pulse h-32 bg-arena-50 rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-800">Tratamiento en Sesión</h3>
        <button
          onClick={guardar}
          disabled={saving}
          className="flex items-center gap-2 bg-salvia-500 hover:bg-salvia-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar'}
        </button>
      </div>

      {/* Puntos de acupuntura */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Puntos de acupuntura</label>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {puntos.map((p) => (
            <span
              key={p}
              className="flex items-center gap-1 bg-salvia-100 text-salvia-700 px-2.5 py-1 rounded-full text-xs font-medium"
            >
              {p}
              <button onClick={() => setPuntos(puntos.filter((x) => x !== p))}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        {/* Puntos rápidos */}
        <div className="flex flex-wrap gap-1 mb-2">
          {PUNTOS_COMUNES.filter((p) => !puntos.includes(p)).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => addPunto(p)}
              className="px-2 py-0.5 text-xs border border-arena-200 rounded text-gray-500 hover:bg-salvia-50 hover:border-salvia-300 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={nuevoPunto}
            onChange={(e) => setNuevoPunto(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPunto(nuevoPunto))}
            className="flex-1 px-3 py-1.5 border border-arena-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-salvia-300"
            placeholder="Añadir punto personalizado"
          />
          <button
            onClick={() => addPunto(nuevoPunto)}
            className="px-3 py-1.5 bg-arena-100 text-gray-600 rounded-lg text-sm hover:bg-arena-200 transition-colors"
          >
            Añadir
          </button>
        </div>
      </div>

      {/* Técnicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Moxa */}
        <div className="border border-arena-200 rounded-lg p-4 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={moxa}
              onChange={(e) => setMoxa(e.target.checked)}
              className="w-4 h-4 text-salvia-500 rounded focus:ring-salvia-300"
            />
            <span className="text-sm font-medium text-gray-700">Moxa</span>
          </label>
          {moxa && (
            <textarea
              value={moxaNotas}
              onChange={(e) => setMoxaNotas(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-arena-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-salvia-300"
              placeholder="Notas sobre moxa..."
            />
          )}
        </div>

        {/* Tuina */}
        <div className="border border-arena-200 rounded-lg p-4 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={tuina}
              onChange={(e) => setTuina(e.target.checked)}
              className="w-4 h-4 text-salvia-500 rounded focus:ring-salvia-300"
            />
            <span className="text-sm font-medium text-gray-700">Tuina</span>
          </label>
          {tuina && (
            <textarea
              value={tuinaNotas}
              onChange={(e) => setTuinaNotas(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-arena-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-salvia-300"
              placeholder="Notas sobre tuina..."
            />
          )}
        </div>

        {/* Ventosas */}
        <div className="border border-arena-200 rounded-lg p-4 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={ventosas}
              onChange={(e) => setVentosas(e.target.checked)}
              className="w-4 h-4 text-salvia-500 rounded focus:ring-salvia-300"
            />
            <span className="text-sm font-medium text-gray-700">Ventosas</span>
          </label>
          {ventosas && (
            <textarea
              value={ventosasNotas}
              onChange={(e) => setVentosasNotas(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-arena-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-salvia-300"
              placeholder="Notas sobre ventosas..."
            />
          )}
        </div>

        {/* Aceites */}
        <div className="border border-arena-200 rounded-lg p-4 space-y-2">
          <span className="text-sm font-medium text-gray-700">Aceites esenciales</span>
          <div className="flex flex-wrap gap-1.5">
            {aceites.map((a, i) => (
              <span
                key={i}
                className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs"
              >
                {a}
                <button onClick={() => setAceites(aceites.filter((_, j) => j !== i))}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={nuevoAceite}
              onChange={(e) => setNuevoAceite(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAceite())}
              className="flex-1 px-2 py-1 border border-arena-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-salvia-300"
              placeholder="Ej: Lavanda, Incienso..."
            />
            <button
              onClick={addAceite}
              className="px-2 py-1 bg-arena-100 text-gray-600 rounded text-xs hover:bg-arena-200"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Otras técnicas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Otras técnicas</label>
        <textarea
          value={otrasTecnicas}
          onChange={(e) => setOtrasTecnicas(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-arena-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-salvia-300"
        />
      </div>

      {/* Observaciones y respuesta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones del tratamiento</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-arena-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-salvia-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Respuesta del paciente</label>
          <textarea
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-arena-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-salvia-300"
            placeholder="Sensaciones durante/después..."
          />
        </div>
      </div>
    </div>
  )
}
