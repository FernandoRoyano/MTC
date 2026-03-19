import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import PatientSearch from '@/components/PatientSearch'

export default async function PacientesPage() {
  const supabase = createClient()

  const { data: pacientes } = await supabase
    .from('pacientes')
    .select('*')
    .order('nombre', { ascending: true })

  return (
    <div className="max-w-4xl">
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Pacientes</h1>
        <Link
          href="/pacientes/nuevo"
          className="flex items-center gap-2 bg-salvia-500 hover:bg-salvia-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo paciente
        </Link>
      </div>

      {/* Buscador */}
      <PatientSearch />

      {/* Lista de pacientes */}
      <div className="bg-white border border-arena-200 rounded-xl overflow-hidden">
        {pacientes && pacientes.length > 0 ? (
          <div className="divide-y divide-arena-100">
            {pacientes.map((paciente) => (
              <Link
                key={paciente.id}
                href={`/pacientes/${paciente.id}`}
                className="flex items-center gap-4 p-4 hover:bg-arena-50 transition-colors"
              >
                <div className="w-10 h-10 bg-salvia-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-salvia-700">
                    {paciente.nombre.charAt(0)}
                    {paciente.apellidos?.charAt(0) || ''}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800">
                    {paciente.nombre} {paciente.apellidos}
                  </p>
                  {paciente.motivo_consulta && (
                    <p className="text-sm text-gray-500 truncate">
                      {paciente.motivo_consulta}
                    </p>
                  )}
                </div>
                {paciente.telefono && (
                  <span className="text-sm text-gray-400 hidden sm:block">
                    {paciente.telefono}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-400">No hay pacientes registrados</p>
            <Link
              href="/pacientes/nuevo"
              className="text-salvia-500 hover:text-salvia-600 text-sm font-medium mt-2 inline-block"
            >
              Crear el primero
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
