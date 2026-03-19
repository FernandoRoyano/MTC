import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Users, ArrowRight, Calendar, TrendingUp } from 'lucide-react'

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
    <div className="max-w-5xl space-y-6 animate-fade-in">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Resumen de tu consulta</p>
        </div>
        <Link
          href="/pacientes/nuevo"
          className="flex items-center gap-2 bg-gradient-to-r from-salvia-500 to-salvia-600 hover:from-salvia-600 hover:to-salvia-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-salvia-500/20 hover:shadow-md hover:shadow-salvia-500/25"
        >
          <Plus className="w-4 h-4" />
          Nuevo paciente
        </Link>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-arena-200/60 rounded-2xl p-5 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-salvia-100 to-salvia-200 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-salvia-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalPacientes}</p>
              <p className="text-xs text-gray-400 font-medium">Pacientes</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-arena-200/60 rounded-2xl p-5 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-terracota-100 to-terracota-200 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-terracota-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalVisitas}</p>
              <p className="text-xs text-gray-400 font-medium">Visitas totales</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-arena-200/60 rounded-2xl p-5 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{visitasBorrador.length}</p>
              <p className="text-xs text-gray-400 font-medium">En borrador</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visitas en borrador */}
      {visitasBorrador.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-amber-50/50 border border-amber-200/60 rounded-2xl p-5 animate-fade-in">
          <h2 className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-3">
            Pendientes de completar
          </h2>
          <div className="space-y-2">
            {visitasBorrador.map((v: Record<string, unknown>) => {
              const pac = v.pacientes as Record<string, string> | null
              return (
                <Link
                  key={v.id as string}
                  href={`/pacientes/${v.paciente_id}/visitas/${v.id}`}
                  className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 hover:bg-white hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                      <span className="text-[10px] font-bold text-amber-600">
                        #{v.numero_visita as number}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {pac?.nombre} {pac?.apellidos}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Últimas visitas */}
        <div className="bg-white border border-arena-200/60 rounded-2xl p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Últimas visitas
          </h2>
          {visitasRecientes.length === 0 ? (
            <p className="text-sm text-gray-300 py-4 text-center">Sin visitas aún</p>
          ) : (
            <div className="space-y-1">
              {visitasRecientes.map((v: Record<string, unknown>) => {
                const pac = v.pacientes as Record<string, string> | null
                return (
                  <Link
                    key={v.id as string}
                    href={`/pacientes/${v.paciente_id}/visitas/${v.id}`}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-arena-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-bold text-gray-300 w-5">
                        #{v.numero_visita as number}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {pac?.nombre} {pac?.apellidos}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        v.estado === 'completada'
                          ? 'bg-green-50 text-green-600'
                          : 'bg-amber-50 text-amber-600'
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
        <div className="bg-white border border-arena-200/60 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Pacientes activos
            </h2>
            <Link
              href="/pacientes"
              className="text-[11px] text-salvia-500 hover:text-salvia-600 font-semibold transition-colors"
            >
              Ver todos
            </Link>
          </div>
          {pacientes.length === 0 ? (
            <p className="text-sm text-gray-300 py-4 text-center">Sin pacientes aún</p>
          ) : (
            <div className="space-y-1">
              {pacientes.map((p) => (
                <Link
                  key={p.id}
                  href={`/pacientes/${p.id}`}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-arena-50 transition-colors group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-salvia-100 to-salvia-200 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-bold text-salvia-700">
                      {p.nombre.charAt(0)}{p.apellidos.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {p.nombre} {p.apellidos}
                    </p>
                    {p.motivo_principal && (
                      <p className="text-[11px] text-gray-400 truncate">{p.motivo_principal}</p>
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
