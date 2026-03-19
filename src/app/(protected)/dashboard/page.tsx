import { createClient } from '@/lib/supabase/server'
import { Calendar, Users, Plus, Clock } from 'lucide-react'
import Link from 'next/link'
import type { Cita, Paciente } from '@/types'

export default async function DashboardPage() {
  const supabase = createClient()

  // Obtener citas de hoy
  const hoy = new Date().toISOString().split('T')[0]
  const { data: citasHoy } = await supabase
    .from('citas')
    .select('*, paciente:pacientes(nombre, apellidos)')
    .gte('fecha_hora', `${hoy}T00:00:00`)
    .lte('fecha_hora', `${hoy}T23:59:59`)
    .order('fecha_hora', { ascending: true })

  // Obtener estadísticas
  const { count: totalPacientes } = await supabase
    .from('pacientes')
    .select('*', { count: 'exact', head: true })

  // Últimos pacientes con sesión
  const { data: ultimosPacientes } = await supabase
    .from('pacientes')
    .select('id, nombre, apellidos')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="max-w-6xl">
      {/* Cabecera */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">
          Buenos días
        </h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/pacientes/nuevo"
          className="flex items-center gap-3 bg-white border border-arena-200 rounded-xl p-4 hover:border-salvia-300 hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 bg-salvia-50 rounded-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-salvia-600" />
          </div>
          <span className="font-medium text-gray-700">Nuevo paciente</span>
        </Link>

        <Link
          href="/agenda"
          className="flex items-center gap-3 bg-white border border-arena-200 rounded-xl p-4 hover:border-salvia-300 hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 bg-beige-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-beige-500" />
          </div>
          <span className="font-medium text-gray-700">Ver agenda</span>
        </Link>

        <Link
          href="/pacientes"
          className="flex items-center gap-3 bg-white border border-arena-200 rounded-xl p-4 hover:border-salvia-300 hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 bg-terracota-50 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-terracota-400" />
          </div>
          <span className="font-medium text-gray-700">Pacientes</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Citas de hoy */}
        <div className="bg-white border border-arena-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-salvia-500" />
            Citas de hoy
          </h2>
          {citasHoy && citasHoy.length > 0 ? (
            <div className="space-y-3">
              {citasHoy.map((cita: Cita & { paciente: Pick<Paciente, 'nombre' | 'apellidos'> | null }) => (
                <div
                  key={cita.id}
                  className="flex items-center justify-between p-3 bg-arena-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-700">
                      {cita.paciente?.nombre} {cita.paciente?.apellidos}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(cita.fecha_hora).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' · '}
                      {cita.duracion_minutos} min
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      cita.estado === 'pendiente'
                        ? 'bg-blue-50 text-blue-600'
                        : cita.estado === 'completada'
                        ? 'bg-salvia-50 text-salvia-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {cita.estado}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No hay citas para hoy</p>
          )}
        </div>

        {/* Últimos pacientes */}
        <div className="bg-white border border-arena-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-salvia-500" />
            Últimos pacientes
          </h2>
          {ultimosPacientes && ultimosPacientes.length > 0 ? (
            <div className="space-y-3">
              {ultimosPacientes.map((paciente: Pick<Paciente, 'id' | 'nombre' | 'apellidos'>) => (
                <Link
                  key={paciente.id}
                  href={`/pacientes/${paciente.id}`}
                  className="flex items-center gap-3 p-3 bg-arena-50 rounded-lg hover:bg-arena-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-salvia-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-salvia-700">
                      {paciente.nombre.charAt(0)}
                    </span>
                  </div>
                  <p className="font-medium text-gray-700">
                    {paciente.nombre} {paciente.apellidos}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Aún no hay pacientes</p>
          )}

          {/* Estadística */}
          <div className="mt-4 pt-4 border-t border-arena-200">
            <p className="text-sm text-gray-500">
              Total: <span className="font-semibold text-gray-700">{totalPacientes || 0}</span> pacientes
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
