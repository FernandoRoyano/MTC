'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Paciente, Visita } from '@/types'
import Link from 'next/link'
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Briefcase,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  FileText,
  AlertTriangle,
  Tag,
  FolderOpen,
} from 'lucide-react'

export default function PacienteDetallePage() {
  const params = useParams()
  const router = useRouter()
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [visitas, setVisitas] = useState<Visita[]>([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Partial<Paciente>>({})
  const [confirmDelete, setConfirmDelete] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    cargarDatos()
  }, [params.id])

  async function cargarDatos() {
    setLoading(true)

    const [pacienteRes, visitasRes] = await Promise.all([
      supabase.from('pacientes').select('*').eq('id', params.id).single(),
      supabase
        .from('visitas')
        .select('*')
        .eq('paciente_id', params.id)
        .order('fecha', { ascending: false }),
    ])

    if (pacienteRes.data) {
      setPaciente(pacienteRes.data)
      setForm(pacienteRes.data)
    }
    if (visitasRes.data) setVisitas(visitasRes.data)

    setLoading(false)
  }

  async function guardarEdicion() {
    if (!paciente) return
    setSaving(true)

    const { error } = await supabase
      .from('pacientes')
      .update({
        nombre: form.nombre,
        apellidos: form.apellidos,
        telefono: form.telefono,
        email: form.email || null,
        fecha_nacimiento: form.fecha_nacimiento || null,
        sexo: form.sexo || null,
        direccion: form.direccion,
        ocupacion: form.ocupacion,
        motivo_principal: form.motivo_principal,
        estado: form.estado,
        alertas: form.alertas,
        observaciones_generales: form.observaciones_generales,
      })
      .eq('id', paciente.id)

    if (!error) {
      setPaciente({ ...paciente, ...form } as Paciente)
      setEditando(false)
    }
    setSaving(false)
  }

  async function eliminarPaciente() {
    if (!paciente) return
    const { error } = await supabase.from('pacientes').delete().eq('id', paciente.id)
    if (!error) {
      router.push('/pacientes')
    }
  }

  async function nuevaVisita() {
    if (!paciente) return
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const { data: visita, error } = await supabase
      .from('visitas')
      .insert({
        paciente_id: paciente.id,
        terapeuta_id: userData.user.id,
      })
      .select()
      .single()

    if (!error && visita) {
      router.push(`/pacientes/${paciente.id}/visitas/${visita.id}`)
    }
  }

  function calcularEdad(fecha: string): number {
    const hoy = new Date()
    const nac = new Date(fecha)
    let edad = hoy.getFullYear() - nac.getFullYear()
    const m = hoy.getMonth() - nac.getMonth()
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--
    return edad
  }

  const sexoLabel: Record<string, string> = {
    mujer: 'Mujer',
    hombre: 'Hombre',
    otro: 'Otro',
    no_especificado: 'No especificado',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-salvia-500" />
      </div>
    )
  }

  if (!paciente) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Paciente no encontrado</p>
        <Link href="/pacientes" className="text-salvia-500 hover:underline mt-2 inline-block">
          Volver a pacientes
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/pacientes"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-arena-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-800">
                {paciente.nombre} {paciente.apellidos}
              </h1>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  paciente.estado === 'activo'
                    ? 'bg-green-100 text-green-700'
                    : paciente.estado === 'alta'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {paciente.estado === 'activo' ? 'Activo' : paciente.estado === 'alta' ? 'Alta' : 'Inactivo'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              {paciente.fecha_nacimiento && (
                <span>{calcularEdad(paciente.fecha_nacimiento)} años</span>
              )}
              {paciente.sexo && paciente.sexo !== 'no_especificado' && (
                <span>· {sexoLabel[paciente.sexo]}</span>
              )}
              {visitas.length > 0 && (
                <span>· {visitas.length} visitas</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setEditando(!editando); setConfirmDelete(false) }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-arena-200 hover:bg-arena-50 text-sm transition-colors"
          >
            {editando ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            {editando ? 'Cancelar' : 'Editar'}
          </button>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={eliminarPaciente}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 text-sm transition-colors"
              >
                Confirmar
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 rounded-lg border border-arena-200 hover:bg-arena-50 text-sm transition-colors"
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alertas */}
      {paciente.alertas && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">{paciente.alertas}</p>
        </div>
      )}

      {/* Datos del paciente */}
      <div className="bg-white border border-arena-200 rounded-xl p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Datos personales</h2>

        {editando ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  value={form.nombre || ''}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                <input
                  value={form.apellidos || ''}
                  onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                  className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                <select
                  value={form.sexo || ''}
                  onChange={(e) => setForm({ ...form, sexo: e.target.value as Paciente['sexo'] })}
                  className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm"
                >
                  <option value="">Sin especificar</option>
                  <option value="mujer">Mujer</option>
                  <option value="hombre">Hombre</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha nacimiento</label>
                <input
                  type="date"
                  value={form.fecha_nacimiento || ''}
                  onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })}
                  className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={form.estado || 'activo'}
                  onChange={(e) => setForm({ ...form, estado: e.target.value as Paciente['estado'] })}
                  className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  value={form.telefono || ''}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email || ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  value={form.direccion || ''}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ocupación</label>
                <input
                  value={form.ocupacion || ''}
                  onChange={(e) => setForm({ ...form, ocupacion: e.target.value })}
                  className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo principal</label>
              <textarea
                value={form.motivo_principal || ''}
                onChange={(e) => setForm({ ...form, motivo_principal: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alertas</label>
              <input
                value={form.alertas || ''}
                onChange={(e) => setForm({ ...form, alertas: e.target.value })}
                className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm"
                placeholder="Alergias, contraindicaciones..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones generales</label>
              <textarea
                value={form.observaciones_generales || ''}
                onChange={(e) => setForm({ ...form, observaciones_generales: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm resize-none"
              />
            </div>
            <button
              onClick={guardarEdicion}
              disabled={saving}
              className="flex items-center gap-2 bg-salvia-500 hover:bg-salvia-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {paciente.telefono && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4 text-salvia-500" />
                {paciente.telefono}
              </div>
            )}
            {paciente.email && (
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4 text-salvia-500" />
                {paciente.email}
              </div>
            )}
            {paciente.fecha_nacimiento && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-salvia-500" />
                {new Date(paciente.fecha_nacimiento).toLocaleDateString('es-ES')}
              </div>
            )}
            {paciente.direccion && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-salvia-500" />
                {paciente.direccion}
              </div>
            )}
            {paciente.ocupacion && (
              <div className="flex items-center gap-2 text-gray-600">
                <Briefcase className="w-4 h-4 text-salvia-500" />
                {paciente.ocupacion}
              </div>
            )}
            {paciente.etiquetas && paciente.etiquetas.length > 0 && (
              <div className="flex items-center gap-2 text-gray-600">
                <Tag className="w-4 h-4 text-salvia-500" />
                <div className="flex gap-1">
                  {paciente.etiquetas.map((e) => (
                    <span key={e} className="bg-arena-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {paciente.motivo_principal && (
              <div className="col-span-full mt-2">
                <p className="text-gray-500 font-medium mb-1">Motivo principal</p>
                <p className="text-gray-700">{paciente.motivo_principal}</p>
              </div>
            )}
            {paciente.observaciones_generales && (
              <div className="col-span-full">
                <p className="text-gray-500 font-medium mb-1">Observaciones</p>
                <p className="text-gray-700">{paciente.observaciones_generales}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visitas */}
      <div className="bg-white border border-arena-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-salvia-500" />
            Visitas
          </h2>
          <button
            onClick={nuevaVisita}
            className="flex items-center gap-1.5 text-sm bg-salvia-500 hover:bg-salvia-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva visita
          </button>
        </div>

        {visitas.length === 0 ? (
          <p className="text-sm text-gray-400">No hay visitas registradas</p>
        ) : (
          <div className="space-y-3">
            {visitas.map((v) => (
              <Link
                key={v.id}
                href={`/pacientes/${paciente.id}/visitas/${v.id}`}
                className="block border border-arena-100 rounded-lg p-4 hover:bg-arena-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
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
                {v.motivo_visita && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-1">{v.motivo_visita}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Documentos */}
      <Link
        href={`/pacientes/${paciente.id}/documentos`}
        className="flex items-center justify-between bg-white border border-arena-200 rounded-xl p-5 hover:border-salvia-300 transition-colors"
      >
        <div className="flex items-center gap-3">
          <FolderOpen className="w-5 h-5 text-salvia-500" />
          <span className="font-medium text-gray-700">Documentos y analíticas</span>
        </div>
        <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
      </Link>
    </div>
  )
}
