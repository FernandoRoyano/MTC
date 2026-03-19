'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plantilla, CategoriaPlantilla } from '@/types'
import { Plus, Edit3, Trash2, Save } from 'lucide-react'

const CATEGORIAS: { value: CategoriaPlantilla; label: string }[] = [
  { value: 'alimentacion', label: 'Alimentación' },
  { value: 'habitos', label: 'Hábitos' },
  { value: 'aceites', label: 'Aceites' },
  { value: 'fitoterapia', label: 'Fitoterapia' },
  { value: 'tratamiento', label: 'Tratamiento' },
  { value: 'respiracion', label: 'Respiración' },
  { value: 'suplementacion', label: 'Suplementación' },
  { value: 'ejercicio', label: 'Ejercicio' },
  { value: 'otro', label: 'Otro' },
]

const CAMPOS_PROTOCOLO = [
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
]

interface PlantillaForm {
  nombre: string
  descripcion: string
  categoria: CategoriaPlantilla | ''
  contenido: Record<string, string>
}

const emptyForm: PlantillaForm = {
  nombre: '',
  descripcion: '',
  categoria: '',
  contenido: {},
}

export default function PlantillasPage() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<PlantillaForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    setLoading(true)
    const { data } = await supabase
      .from('plantillas')
      .select('*')
      .order('nombre')
    if (data) setPlantillas(data)
    setLoading(false)
  }

  function startCreate() {
    setCreating(true)
    setEditingId(null)
    setForm(emptyForm)
  }

  function startEdit(p: Plantilla) {
    setEditingId(p.id)
    setCreating(false)
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      categoria: p.categoria || '',
      contenido: (p.contenido || {}) as Record<string, string>,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setCreating(false)
    setForm(emptyForm)
  }

  async function guardar() {
    if (!form.nombre.trim()) return
    setSaving(true)

    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion || null,
      categoria: form.categoria || null,
      contenido: form.contenido,
    }

    if (editingId) {
      await supabase.from('plantillas').update(payload).eq('id', editingId)
    } else {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { setSaving(false); return }
      await supabase.from('plantillas').insert({ ...payload, terapeuta_id: userData.user.id })
    }

    setSaving(false)
    cancelEdit()
    cargar()
  }

  async function eliminar(id: string) {
    await supabase.from('plantillas').delete().eq('id', id)
    setConfirmDelete(null)
    cargar()
  }

  function categoriaLabel(cat: string | null): string {
    return CATEGORIAS.find((c) => c.value === cat)?.label || 'Sin categoría'
  }

  if (loading) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Plantillas</h1>
        <div className="animate-pulse h-32 bg-arena-50 rounded-xl" />
      </div>
    )
  }

  const showForm = creating || editingId

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Plantillas</h1>
        {!showForm && (
          <button
            onClick={startCreate}
            className="flex items-center gap-2 bg-salvia-500 hover:bg-salvia-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva plantilla
          </button>
        )}
      </div>

      {/* Formulario crear/editar */}
      {showForm && (
        <div className="bg-white border border-arena-200 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-800">
            {creating ? 'Nueva plantilla' : 'Editar plantilla'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm"
                placeholder="Ej: Protocolo base digestivo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value as CategoriaPlantilla })}
                className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm"
              >
                <option value="">Sin categoría</option>
                {CATEGORIAS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <input
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm"
              placeholder="Breve descripción de la plantilla"
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Contenido del protocolo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CAMPOS_PROTOCOLO.map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <textarea
                    value={form.contenido[key] || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        contenido: { ...form.contenido, [key]: e.target.value },
                      })
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-arena-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-salvia-300"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={guardar}
              disabled={saving || !form.nombre.trim()}
              className="flex items-center gap-2 bg-salvia-500 hover:bg-salvia-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={cancelEdit}
              className="px-4 py-2 border border-arena-200 rounded-lg text-sm hover:bg-arena-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de plantillas */}
      {plantillas.length === 0 && !showForm ? (
        <div className="bg-white border border-arena-200 rounded-xl p-8 text-center">
          <p className="text-gray-400 mb-2">No hay plantillas creadas</p>
          <button
            onClick={startCreate}
            className="text-salvia-500 hover:text-salvia-600 text-sm font-medium"
          >
            Crear la primera
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {plantillas.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-arena-200 rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-800">{p.nombre}</h3>
                  {p.categoria && (
                    <span className="text-xs bg-salvia-50 text-salvia-600 px-2 py-0.5 rounded-full">
                      {categoriaLabel(p.categoria)}
                    </span>
                  )}
                  {!p.activa && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      Inactiva
                    </span>
                  )}
                </div>
                {p.descripcion && (
                  <p className="text-sm text-gray-500 mt-1">{p.descripcion}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(p)}
                  className="p-2 rounded-lg hover:bg-arena-50 text-gray-500 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                {confirmDelete === p.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => eliminar(p.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs"
                    >
                      Sí
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="px-3 py-1 border border-arena-200 rounded-lg text-xs"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(p.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
