import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Users, FileText, ArrowRight } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()

  const [pacientesRes, visitasRecientesRes, visitasBorradorRes, totalPacientesRes, totalVisitasRes] =
    await Promise.all([
      supabase
        .from('pacientes')
        .select('id, nombre, apellidos, motivo_principal, estado')
        .eq('estado', 'activo')
        .order('updated_at', { ascending: false })
        .limit(5),
      supabase
        .from('visitas')
        .select('id, paciente_id, fecha, numero_visita, estado, motivo_visita, pacientes(nombre, apellidos)')
        .order('fecha', { ascending: false })
        .limit(5),
      supabase
        .from('visitas')
        .select('id, paciente_id, fecha, numero_visita, motivo_visita, pacientes(nombre, apellidos)')
        .eq('estado', 'borrador')
        .order('fecha', { ascending: false })
        .limit(5),
      supabase.from('pacientes').select('id', { count: 'exact', head: true }),
      supabase.from('visitas').select('id', { count: 'exact', head: true }),
    ])

  const pacientes = pacientesRes.data || []
  const visitasRecientes = visitasRecientesRes.data || []
  const visitasBorrador = visitasBorradorRes.data || []
  const totalPacientes = totalPacientesRes.count || 0
  const totalVisitas = totalVisitasRes.count || 0

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500">Resumen de tu consulta</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/pacientes/nuevo"
            className="flex items-center gap-2 bg-salvia-500 hover:bg-salvia-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo paciente
          </Link>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-arena-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-salvia-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-salvia-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-800">{totalPacientes}</p>
              <p className="text-sm text-gray-500">Pacientes</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-arena-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-terracota-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-terracota-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-800">{totalVisitas}</p>
              <p className="text-sm text-gray-500">Visitas totales</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visitas en borrador */}
      {visitasBorrador.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-amber-800 mb-3">
            Visitas en borrador ({visitasBorrador.length})
          </h2>
          <div className="space-y-2">
            {visitasBorrador.map((v: Record<string, unknown>) => {
              const pac = v.pacientes as Record<string, string> | null
              return (
                <Link
                  key={v.id as string}
                  href={`/pacientes/${v.paciente_id}/visitas/${v.id}`}
                  className="flex items-center justify-between bg-white rounded-lg px-4 py-3 hover:shadow-sm transition-shadow"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-800">
                      {pac?.nombre} {pac?.apellidos}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      Visita #{v.numero_visita as number}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Últimas visitas */}
        <div className="bg-white border border-arena-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Últimas visitas</h2>
          {visitasRecientes.length === 0 ? (
            <p className="text-sm text-gray-400">Sin visitas aún</p>
          ) : (
            <div className="space-y-2">
              {visitasRecientes.map((v: Record<string, unknown>) => {
                const pac = v.pacientes as Record<string, string> | null
                return (
                  <Link
                    key={v.id as string}
                    href={`/pacientes/${v.paciente_id}/visitas/${v.id}`}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-arena-50 transition-colors"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        {pac?.nombre} {pac?.apellidos}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        #{v.numero_visita as number}
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
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Pacientes activos */}
        <div className="bg-white border border-arena-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Pacientes activos</h2>
            <Link
              href="/pacientes"
              className="text-xs text-salvia-600 hover:text-salvia-700 font-medium"
            >
              Ver todos
            </Link>
          </div>
          {pacientes.length === 0 ? (
            <p className="text-sm text-gray-400">Sin pacientes aún</p>
          ) : (
            <div className="space-y-2">
              {pacientes.map((p) => (
                <Link
                  key={p.id}
                  href={`/pacientes/${p.id}`}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-arena-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-salvia-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-salvia-700">
                      {p.nombre.charAt(0)}{p.apellidos.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {p.nombre} {p.apellidos}
                    </p>
                    {p.motivo_principal && (
                      <p className="text-xs text-gray-400 truncate">{p.motivo_principal}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
