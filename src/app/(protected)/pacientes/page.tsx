'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Paciente } from '@/types'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<string>('activo')

  const supabase = createClient()

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    setLoading(true)
    const { data } = await supabase
      .from('pacientes')
      .select('*')
      .order('nombre', { ascending: true })
    if (data) setPacientes(data)
    setLoading(false)
  }

  const filtrados = pacientes.filter((p) => {
    const matchQuery =
      !query ||
      `${p.nombre} ${p.apellidos}`.toLowerCase().includes(query.toLowerCase()) ||
      p.telefono?.includes(query) ||
      p.email?.toLowerCase().includes(query.toLowerCase())

    const matchEstado = !filtroEstado || p.estado === filtroEstado

    return matchQuery && matchEstado
  })

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

      {/* Buscador + filtros */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, teléfono o email..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-arena-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-salvia-300 focus:border-salvia-400 text-sm"
          />
        </div>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-3 py-2.5 bg-white border border-arena-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-salvia-300"
        >
          <option value="">Todos</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
          <option value="alta">Alta</option>
        </select>
      </div>

      {/* Contador */}
      <p className="text-xs text-gray-400 mb-2">{filtrados.length} pacientes</p>

      {/* Lista */}
      {loading ? (
        <div className="bg-white border border-arena-200 rounded-xl p-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-arena-50 rounded-lg" />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-arena-200 rounded-xl overflow-hidden">
          {filtrados.length > 0 ? (
            <div className="divide-y divide-arena-100">
              {filtrados.map((paciente) => (
                <Link
                  key={paciente.id}
                  href={`/pacientes/${paciente.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-arena-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-salvia-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-salvia-700">
                      {paciente.nombre.charAt(0)}
                      {paciente.apellidos.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800">
                        {paciente.nombre} {paciente.apellidos}
                      </p>
                      {paciente.estado !== 'activo' && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            paciente.estado === 'alta'
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {paciente.estado === 'alta' ? 'Alta' : 'Inactivo'}
                        </span>
                      )}
                    </div>
                    {paciente.motivo_principal && (
                      <p className="text-sm text-gray-500 truncate">
                        {paciente.motivo_principal}
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
              <p className="text-gray-400">
                {query ? 'Sin resultados para esta búsqueda' : 'No hay pacientes registrados'}
              </p>
              {!query && (
                <Link
                  href="/pacientes/nuevo"
                  className="text-salvia-500 hover:text-salvia-600 text-sm font-medium mt-2 inline-block"
                >
                  Crear el primero
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
