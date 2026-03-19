'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Paciente, Anamnesis, Sesion } from '@/types'
import Link from 'next/link'
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  FileText,
  Activity,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
} from 'lucide-react'

export default function PacienteDetallePage() {
  const params = useParams()
  const router = useRouter()
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [anamnesis, setAnamnesis] = useState<Anamnesis[]>([])
  const [sesiones, setSesiones] = useState<Sesion[]>([])
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

    const [pacienteRes, anamnesisRes, sesionesRes] = await Promise.all([
      supabase.from('pacientes').select('*').eq('id', params.id).single(),
      supabase
        .from('anamnesis')
        .select('*')
        .eq('paciente_id', params.id)
        .order('fecha', { ascending: false }),
      supabase
        .from('sesiones')
        .select('*')
        .eq('paciente_id', params.id)
        .order('fecha', { ascending: false }),
    ])

    if (pacienteRes.data) {
      setPaciente(pacienteRes.data)
      setForm(pacienteRes.data)
    }
    if (anamnesisRes.data) setAnamnesis(anamnesisRes.data)
    if (sesionesRes.data) setSesiones(sesionesRes.data)

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
        motivo_consulta: form.motivo_consulta,
        notas_generales: form.notas_generales,
      })
      .eq('id', paciente.id)

    if (!error) {
      setPaciente({ ...paciente, ...form } as Paciente)
      setEditando(false)
    }
    setSaving(false)
  }

  function calcularEdad(fecha: string): number {
    const hoy = new Date()
    const nac = new Date(fecha)
    let edad = hoy.getFullYear() - nac.getFullYear()
    const m = hoy.getMonth() - nac.getMonth()
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--
    return edad
  }

  async function eliminarPaciente() {
    if (!paciente) return
    const { error } = await supabase.from('pacientes').delete().eq('id', paciente.id)
    if (!error) {
      router.push('/pacientes')
    }
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
            <h1 className="text-2xl font-semibold text-gray-800">
              {paciente.nombre} {paciente.apellidos || ''}
            </h1>
            {paciente.fecha_nacimiento && (
              <p className="text-sm text-gray-500">
                {calcularEdad(paciente.fecha_nacimiento)} años
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditando(!editando)}
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
              Eliminar
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={eliminarPaciente}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 text-sm transition-colors"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
              <input
                type="date"
                value={form.fecha_nacimiento || ''}
                onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })}
                className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de consulta</label>
              <textarea
                value={form.motivo_consulta || ''}
                onChange={(e) => setForm({ ...form, motivo_consulta: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas generales</label>
              <textarea
                value={form.notas_generales || ''}
                onChange={(e) => setForm({ ...form, notas_generales: e.target.value })}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
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
            {paciente.motivo_consulta && (
              <div className="col-span-full">
                <p className="text-gray-500 font-medium mb-1">Motivo de consulta</p>
                <p className="text-gray-700">{paciente.motivo_consulta}</p>
              </div>
            )}
            {paciente.notas_generales && (
              <div className="col-span-full">
                <p className="text-gray-500 font-medium mb-1">Notas generales</p>
                <p className="text-gray-700">{paciente.notas_generales}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Última anamnesis */}
      <div className="bg-white border border-arena-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-salvia-500" />
            Anamnesis
          </h2>
          <Link
            href={`/pacientes/${paciente.id}/anamnesis/nueva`}
            className="flex items-center gap-1.5 text-sm text-salvia-600 hover:text-salvia-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Nueva anamnesis
          </Link>
        </div>

        {anamnesis.length === 0 ? (
          <p className="text-sm text-gray-400">No hay anamnesis registradas</p>
        ) : (
          <div className="space-y-3">
            {anamnesis.map((a) => (
              <div
                key={a.id}
                className="border border-arena-100 rounded-lg p-4 hover:bg-arena-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {new Date(a.fecha).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-500">
                  {a.pulso_descripcion && <span>Pulso: {a.pulso_descripcion}</span>}
                  {a.lengua_cuerpo && <span>Lengua: {a.lengua_cuerpo}</span>}
                  {a.energia && <span>Energía: {a.energia}</span>}
                  {a.sueno && <span>Sueño: {a.sueno}</span>}
                  {a.digestion && <span>Digestión: {a.digestion}</span>}
                  {a.dolor && <span>Dolor: {a.dolor}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sesiones */}
      <div className="bg-white border border-arena-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-salvia-500" />
            Sesiones
          </h2>
        </div>

        {sesiones.length === 0 ? (
          <p className="text-sm text-gray-400">No hay sesiones registradas</p>
        ) : (
          <div className="space-y-3">
            {sesiones.map((s) => (
              <div
                key={s.id}
                className="border border-arena-100 rounded-lg p-4 hover:bg-arena-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {new Date(s.fecha).toLocaleDateString('es-ES')}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      s.estado === 'completada'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {s.estado === 'completada' ? 'Completada' : 'En curso'}
                  </span>
                </div>
                {s.tratamiento_tipo && s.tratamiento_tipo.length > 0 && (
                  <div className="flex gap-1.5 mt-2">
                    {s.tratamiento_tipo.map((t) => (
                      <span
                        key={t}
                        className="text-xs bg-arena-100 text-gray-600 px-2 py-0.5 rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                {s.notas_sesion && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{s.notas_sesion}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
