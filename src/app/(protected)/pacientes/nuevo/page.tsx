'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

const pacienteSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  apellidos: z.string().min(1, 'Los apellidos son obligatorios'),
  fecha_nacimiento: z.string().optional(),
  sexo: z.enum(['mujer', 'hombre', 'otro', 'no_especificado']).optional(),
  telefono: z.string().optional(),
  email: z.string().email('Email no válido').optional().or(z.literal('')),
  direccion: z.string().optional(),
  ocupacion: z.string().optional(),
  motivo_principal: z.string().optional(),
  observaciones_generales: z.string().optional(),
})

type PacienteForm = z.infer<typeof pacienteSchema>

export default function NuevoPacientePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PacienteForm>({
    resolver: zodResolver(pacienteSchema),
  })

  const onSubmit = async (data: PacienteForm) => {
    setSaving(true)
    const supabase = createClient()

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const { data: paciente, error } = await supabase
      .from('pacientes')
      .insert({
        ...data,
        fecha_nacimiento: data.fecha_nacimiento || null,
        email: data.email || null,
        sexo: data.sexo || null,
        terapeuta_id: userData.user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error al crear paciente:', error)
      setSaving(false)
      return
    }

    router.push(`/pacientes/${paciente.id}`)
  }

  return (
    <div className="max-w-2xl">
      {/* Cabecera */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/pacientes"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-arena-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-800">Nuevo paciente</h1>
      </div>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white border border-arena-200 rounded-xl p-6 space-y-5"
      >
        {/* Nombre y apellidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre *
            </label>
            <input
              {...register('nombre')}
              className="w-full px-3 py-2.5 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 focus:border-salvia-400 text-sm"
              placeholder="Nombre"
            />
            {errors.nombre && (
              <p className="text-xs text-terracota-500 mt-1">{errors.nombre.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Apellidos *
            </label>
            <input
              {...register('apellidos')}
              className="w-full px-3 py-2.5 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 focus:border-salvia-400 text-sm"
              placeholder="Apellidos"
            />
            {errors.apellidos && (
              <p className="text-xs text-terracota-500 mt-1">{errors.apellidos.message}</p>
            )}
          </div>
        </div>

        {/* Sexo y fecha nacimiento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Sexo
            </label>
            <select
              {...register('sexo')}
              className="w-full px-3 py-2.5 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 focus:border-salvia-400 text-sm"
            >
              <option value="">Sin especificar</option>
              <option value="mujer">Mujer</option>
              <option value="hombre">Hombre</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Fecha de nacimiento
            </label>
            <input
              {...register('fecha_nacimiento')}
              type="date"
              className="w-full px-3 py-2.5 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 focus:border-salvia-400 text-sm"
            />
          </div>
        </div>

        {/* Contacto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Teléfono
            </label>
            <input
              {...register('telefono')}
              className="w-full px-3 py-2.5 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 focus:border-salvia-400 text-sm"
              placeholder="600 000 000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-3 py-2.5 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 focus:border-salvia-400 text-sm"
              placeholder="email@ejemplo.com"
            />
            {errors.email && (
              <p className="text-xs text-terracota-500 mt-1">{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Dirección y ocupación */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Dirección
            </label>
            <input
              {...register('direccion')}
              className="w-full px-3 py-2.5 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 focus:border-salvia-400 text-sm"
              placeholder="Dirección"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ocupación
            </label>
            <input
              {...register('ocupacion')}
              className="w-full px-3 py-2.5 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 focus:border-salvia-400 text-sm"
              placeholder="Ocupación"
            />
          </div>
        </div>

        {/* Motivo principal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Motivo principal de consulta
          </label>
          <textarea
            {...register('motivo_principal')}
            rows={3}
            className="w-full px-3 py-2.5 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 focus:border-salvia-400 text-sm resize-none"
            placeholder="¿Por qué acude a consulta?"
          />
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Observaciones generales
          </label>
          <textarea
            {...register('observaciones_generales')}
            rows={3}
            className="w-full px-3 py-2.5 border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 focus:border-salvia-400 text-sm resize-none"
            placeholder="Alergias, medicación, notas importantes..."
          />
        </div>

        {/* Botón guardar */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-salvia-500 hover:bg-salvia-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar paciente'}
          </button>
        </div>
      </form>
    </div>
  )
}
